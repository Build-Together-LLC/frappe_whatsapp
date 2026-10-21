import base64
import json
from unittest.mock import MagicMock, patch

import frappe
from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp.api import groups_and_contacts, webhook
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message import whatsapp_chat_message as message
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session import whatsapp_session as session_module

STAFF = "wa.staff@example.com"
OUTSIDER = "wa.outsider@example.com"
SESSION = "send-test-session"
CHAT = "919811111111@c.us"


def make_user(email):
    if not frappe.db.exists("User", email):
        frappe.get_doc(
            {"doctype": "User", "email": email, "first_name": "Wa", "send_welcome_email": 0, "roles": [{"role": "Desk User"}]}
        ).insert(ignore_permissions=True)


def ok(payload=None):
    reply = MagicMock(ok=True, status_code=200)
    reply.json.return_value = payload or {"id": "true_919811111111@c.us_ABC"}
    return reply


class TestSendWithoutSystemManager(IntegrationTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        make_user(STAFF)
        make_user(OUTSIDER)
        if not frappe.db.exists("WhatsApp Session", {"session_id": SESSION}):
            frappe.get_doc(
                {
                    "doctype": "WhatsApp Session",
                    "session_id": SESSION,
                    "status": "WORKING",
                    "session_assign_to": [{"user_assign": STAFF}],
                }
            ).insert(ignore_permissions=True)
        session_name = frappe.db.get_value("WhatsApp Session", {"session_id": SESSION})
        cls.session = session_name or SESSION
        if not frappe.db.exists("WhatsApp Chat", {"chat_id": CHAT}):
            frappe.get_doc(
                {
                    "doctype": "WhatsApp Chat",
                    "chat_id": CHAT,
                    "chat_name": "Customer",
                    "type": "Contact",
                    "chat_assign_to": [{"user_assign": STAFF}],
                }
            ).insert(ignore_permissions=True)

    def send(self, user, **kwargs):
        with self.set_user(user), patch.object(message, "waha_api_dispatcher", return_value=ok()) as dispatcher:
            result = message.send_chat_message(self.session, CHAT, **kwargs)
        return result, dispatcher

    def test_an_assigned_non_admin_can_send_text(self):
        result, dispatcher = self.send(STAFF, body="hello there")
        self.assertTrue(result)
        urls = [call.args[1] for call in dispatcher.call_args_list]
        self.assertIn("/api/sendText", urls)

    def test_an_unassigned_user_is_refused_and_nothing_is_sent(self):
        with patch.object(message, "waha_api_dispatcher") as dispatcher:
            with self.set_user(OUTSIDER):
                self.assertRaises(frappe.PermissionError, message.send_chat_message, self.session, CHAT, body="hi")
        dispatcher.assert_not_called()

    def test_unknown_message_type_is_rejected(self):
        with self.set_user(STAFF):
            self.assertRaises(frappe.ValidationError, message.send_chat_message, self.session, CHAT, message_type="Sticker")

    def test_a_bad_chat_id_is_rejected(self):
        with self.set_user(STAFF):
            self.assertRaises(frappe.ValidationError, message.send_chat_message, self.session, "../etc@c.us", body="x")

    def test_an_empty_text_is_rejected(self):
        with self.set_user(STAFF):
            self.assertRaises(frappe.ValidationError, message.send_chat_message, self.session, CHAT, body="  ")

    def test_a_scheduled_message_is_stored_not_sent(self):
        with self.set_user(STAFF), patch.object(message, "waha_api_dispatcher") as dispatcher:
            name = message.send_chat_message(self.session, CHAT, body="later", scheduled_at="2099-01-01 10:00:00")
        dispatcher.assert_not_called()
        self.assertEqual(frappe.db.get_value("WhatsApp Chat Message", name, "status"), "Scheduled")
        frappe.delete_doc("WhatsApp Chat Message", name, ignore_permissions=True)

    def test_media_is_read_through_the_file_checks(self):
        with self.set_user(STAFF):
            self.assertRaises(
                frappe.ValidationError, message.send_chat_message, self.session, CHAT, message_type="Image", media_url="/etc/passwd"
            )

    def test_an_uploaded_image_is_sent_as_base64(self):
        with self.set_user(STAFF):
            upload = frappe.get_doc(
                {"doctype": "File", "file_name": "pic.png", "content": b"PNG-demo", "is_private": 1}
            ).insert(ignore_permissions=True)
        _, dispatcher = self.send(
            STAFF, message_type="Image", media_url=upload.file_url, mime_type="image/png", file_name="pic.png", caption="look"
        )
        url, payload = dispatcher.call_args_list[-1].args[1:3]
        sent = json.loads(payload)
        self.assertEqual(url, "/api/sendImage")
        self.assertEqual(base64.b64decode(sent["file"]["data"]), b"PNG-demo")
        self.assertEqual(sent["caption"], "look")
        self.assertEqual(sent["chatId"], CHAT)

    def test_the_selected_session_reply_has_only_what_the_inbox_needs(self):
        with self.set_user(STAFF):
            data = session_module.get_selected_session(self.session)
        self.assertEqual(set(data), set(session_module.SESSION_FIELDS))
        self.assertNotIn("session_assign_to", data)

    def test_the_selected_session_is_hidden_from_others(self):
        with self.set_user(OUTSIDER):
            self.assertIsNone(session_module.get_selected_session(self.session))

    def test_the_chat_detail_reply_leaves_out_other_users_counters(self):
        with self.set_user(STAFF):
            data = groups_and_contacts.get_detail(CHAT, self.session)
        self.assertIsInstance(data, dict)
        for hidden in ("unread_count", "last_message", "archived_by", "owner"):
            self.assertNotIn(hidden, data)
        self.assertEqual(data["chat_assign_to"][0]["user_assign"], STAFF)

    @classmethod
    def tearDownClass(cls):
        frappe.db.rollback()
        super().tearDownClass()


class TestCountryCode(IntegrationTestCase):
    def test_a_ten_digit_number_gets_the_configured_code(self):
        with patch.object(message, "get_default_country_code", return_value="44"):
            self.assertEqual(message.format_whatsapp_id("7911123456"), "447911123456@c.us")

    def test_a_full_number_and_an_id_are_left_alone(self):
        self.assertEqual(message.format_whatsapp_id("919811111111"), "919811111111@c.us")
        self.assertEqual(message.format_whatsapp_id("123@lid"), "123@lid")


class TestSessionDeleteCleanup(IntegrationTestCase):
    def doc(self):
        return frappe.get_doc({"doctype": "WhatsApp Session", "name": "gone-session"})

    def test_waha_session_is_deleted_with_the_erp_session(self):
        with patch.object(session_module, "get_waha_host", return_value="http://waha"), patch.object(
            session_module, "waha_api_dispatcher", return_value=ok()
        ) as dispatcher:
            self.doc().on_trash()
        dispatcher.assert_called_once_with("DELETE", "/api/sessions/gone-session")

    def test_the_session_name_is_url_encoded(self):
        doc = self.doc()
        doc.name = "a b/c"
        with patch.object(session_module, "get_waha_host", return_value="http://waha"), patch.object(
            session_module, "waha_api_dispatcher", return_value=ok()
        ) as dispatcher:
            doc.on_trash()
        dispatcher.assert_called_once_with("DELETE", "/api/sessions/a%20b%2Fc")

    def test_an_unreachable_waha_does_not_block_deleting(self):
        with patch.object(session_module, "get_waha_host", return_value="http://waha"), patch.object(
            session_module, "waha_api_dispatcher", return_value=None
        ), patch.object(session_module.frappe, "msgprint") as notice:
            self.doc().on_trash()
        notice.assert_called_once()

    def test_a_session_already_gone_from_waha_is_not_a_problem(self):
        gone = MagicMock(ok=False, status_code=404)
        with patch.object(session_module, "get_waha_host", return_value="http://waha"), patch.object(
            session_module, "waha_api_dispatcher", return_value=gone
        ), patch.object(session_module.frappe, "msgprint") as notice:
            self.doc().on_trash()
        notice.assert_not_called()

    def test_nothing_is_called_when_waha_is_not_configured(self):
        with patch.object(session_module, "get_waha_host", return_value=""), patch.object(
            session_module, "waha_api_dispatcher"
        ) as dispatcher:
            self.doc().on_trash()
        dispatcher.assert_not_called()


class TestWebhookRateLimit(IntegrationTestCase):
    def test_the_endpoint_is_rate_limited(self):
        self.assertTrue(hasattr(webhook.handle, "__wrapped__"))

    def test_default_and_configured_limit(self):
        self.assertEqual(webhook.webhook_rate_limit(), 1200)
        frappe.conf.waha_webhook_rate_limit = 50
        try:
            self.assertEqual(webhook.webhook_rate_limit(), 50)
        finally:
            del frappe.conf["waha_webhook_rate_limit"]
