from datetime import timedelta
from unittest.mock import MagicMock, patch

import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils import now_datetime

from frappe_whatsapp.frappe_whatsapp.doctype.whatsapp_settings.whatsapp_settings import test_waha_connection
from frappe_whatsapp.personal_whatsapp import security
from frappe_whatsapp.personal_whatsapp.api import groups_and_contacts, webhook
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat import whatsapp_chat
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message import whatsapp_chat_message
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session import whatsapp_session

NOT_ADMIN = patch.object(security, "is_admin_user", return_value=False)


class TestValidators(IntegrationTestCase):
    def test_session_names(self):
        for ok in ("default", "57cdbh2ps3", "Sales Phone", "a-b_c"):
            self.assertEqual(security.valid_session(ok), ok)
        for bad in ("", "a/b", "../x", "a?b", "a#b", "x" * 200, None, "a\nb"):
            with self.subTest(bad=bad):
                self.assertRaises(frappe.ValidationError, security.valid_session, bad)

    def test_chat_ids(self):
        for ok in ("919900000011@c.us", "120363000000011@g.us", "250053180522617@lid"):
            self.assertEqual(security.valid_chat_id(ok), ok)
        for bad in ("", "919900000011", "a/b@c.us", "../x@c.us", "x@evil.com", "a b@c.us", "x@c.us?y=1"):
            with self.subTest(bad=bad):
                self.assertRaises(frappe.ValidationError, security.valid_chat_id, bad)


class TestEndpointsRequireAccess(IntegrationTestCase):
    def test_user_without_session_access_is_refused_everywhere(self):
        calls = [
            (whatsapp_chat.get_whatsapp_contact, ("6291153739", "default")),
            (whatsapp_chat.create_whatsapp_contact, ("919900000011@c.us", "default")),
            (whatsapp_chat.create_whatsapp_group, ("Team", '["919900000011@c.us"]', "default")),
            (whatsapp_chat.leave_whatsapp_group, ("120363000000011@g.us", "default")),
            (groups_and_contacts.get_list, ("default",)),
        ]
        with NOT_ADMIN, self.set_user("Guest"):
            for fn, args in calls:
                with self.subTest(fn=fn.__name__):
                    self.assertRaises(frappe.PermissionError, fn, *args)

    def test_admin_only_actions_are_refused_for_others(self):
        calls = [
            (groups_and_contacts.assign_user_to_contact, ("a@example.com", "919900000011@c.us")),
            (groups_and_contacts.un_assign_user_to_contact, ("a@example.com", "919900000011@c.us")),
            (whatsapp_session.assign_user_to_session, ("a@example.com", "default")),
            (whatsapp_session.un_assign_user_to_session, ("a@example.com", "default")),
        ]
        with NOT_ADMIN, self.set_user("Guest"):
            for fn, args in calls:
                with self.subTest(fn=fn.__name__):
                    self.assertRaises(frappe.PermissionError, fn, *args)

    def test_legacy_unprotected_copies_are_gone(self):
        from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_contact import whatsapp_contact
        from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_group import whatsapp_group

        for module in (whatsapp_contact, whatsapp_group):
            for name in ("get_whatsapp_contact", "create_whatsapp_contact", "create_whatsapp_group", "leave_whatsapp_group"):
                self.assertFalse(hasattr(module, name), f"{module.__name__}.{name}")

    def test_bad_ids_never_reach_waha(self):
        with patch.object(whatsapp_chat, "waha_api_dispatcher") as waha, patch.object(security, "has_session_access", return_value=True):
            self.assertRaises(frappe.ValidationError, whatsapp_chat.get_whatsapp_contact, "1&session=other", "default")
            self.assertRaises(frappe.ValidationError, whatsapp_chat.get_whatsapp_contact, "6291153739", "../sessions")
            self.assertRaises(frappe.ValidationError, whatsapp_chat.create_whatsapp_contact, "../x@c.us", "default")
            waha.assert_not_called()


class TestWebhookIsFailClosed(IntegrationTestCase):
    @patch.object(webhook, "get_webhook_secret", return_value=None)
    def test_unconfigured_secret_rejects_the_request(self, _):
        self.assertRaises(frappe.AuthenticationError, webhook.handle)

    @patch.object(whatsapp_session, "get_webhook_secret", return_value=None)
    def test_session_will_not_start_without_a_secret(self, _):
        self.assertRaises(frappe.ValidationError, frappe.new_doc("WhatsApp Session").start)

    def test_old_logs_are_deleted_and_recent_ones_kept(self):
        old = frappe.get_doc({"doctype": "WhatsApp Webhook Log", "payload": "{}"}).insert(ignore_permissions=True)
        new = frappe.get_doc({"doctype": "WhatsApp Webhook Log", "payload": "{}"}).insert(ignore_permissions=True)
        frappe.db.set_value("WhatsApp Webhook Log", old.name, "creation", now_datetime() - timedelta(days=30))
        webhook.delete_old_webhook_logs()
        self.assertFalse(frappe.db.exists("WhatsApp Webhook Log", old.name))
        self.assertTrue(frappe.db.exists("WhatsApp Webhook Log", new.name))


class TestSending(IntegrationTestCase):
    def message(self):
        doc = frappe.new_doc("WhatsApp Chat Message")
        doc.update({"session": "default", "user_id": "919900000011@c.us", "conversation_type": "Personal", "message_type": "Text", "body": "hi", "type": "Outgoing"})
        return doc

    def test_send_requires_access_to_the_chat(self):
        with patch.object(whatsapp_chat_message, "is_group_contact_access_available", return_value=False), patch.object(
            whatsapp_chat_message, "waha_api_dispatcher"
        ) as waha:
            self.assertRaises(frappe.PermissionError, self.message().send)
            waha.assert_not_called()

    def test_media_must_be_a_file_on_this_site(self):
        for url in ("http://169.254.169.254/latest/meta-data", "//evil.example/x.png", "/api/method/ping", "", None, "/files/does-not-exist.png"):
            with self.subTest(url=url):
                self.assertRaises(frappe.ValidationError, whatsapp_chat_message.read_media_file, url)

    def test_mark_as_seen_checks_the_messages_own_session(self):
        message = MagicMock(conversation_type="Personal", user_id="919900000011@c.us", group_id=None, session="other")
        with patch.object(whatsapp_chat_message.frappe, "get_doc", return_value=message), patch.object(
            whatsapp_chat_message, "is_group_contact_access_available", return_value=False
        ) as access:
            self.assertRaises(frappe.PermissionError, whatsapp_chat_message.mark_as_seen, "x", "default")
            access.assert_called_once_with("919900000011@c.us", "other")


class TestConnectionCheck(IntegrationTestCase):
    def reply(self):
        return MagicMock(status_code=200, ok=True)

    def run_check(self, host):
        target = "frappe_whatsapp.frappe_whatsapp.doctype.whatsapp_settings.whatsapp_settings"
        with patch("frappe_whatsapp.personal_whatsapp.config.get_waha_host", return_value=host), patch(
            "frappe_whatsapp.personal_whatsapp.utils.waha_api_dispatcher", return_value=self.reply()
        ):
            return test_waha_connection()

    def test_warns_about_plain_http_to_a_remote_host(self):
        self.assertIn("Warning", self.run_check("http://waha.example.com:3000")["message"])

    def test_no_warning_for_local_or_https(self):
        for host in ("http://localhost:3000", "http://host.docker.internal:3000", "https://waha.example.com"):
            with self.subTest(host=host):
                self.assertNotIn("Warning", self.run_check(host)["message"])
