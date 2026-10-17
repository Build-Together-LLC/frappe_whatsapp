from unittest.mock import MagicMock, patch

import frappe
from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp.api import webhook


def event(session, status="STARTING", me=None):
    return {"event": "session.status", "session": session, "payload": {"status": status}, "me": me}


def waha_says(status):
    reply = MagicMock(ok=True)
    reply.json.return_value = {"status": status}
    return reply


class TestSessionStatus(IntegrationTestCase):
    def make_session(self):
        doc = frappe.get_doc({"doctype": "WhatsApp Session", "session_id": f"status-{frappe.generate_hash(length=8)}", "status": "STARTING"}).insert(ignore_permissions=True)
        return doc.name

    def test_a_late_retried_event_cannot_overwrite_the_real_status(self):
        name = self.make_session()
        with patch.object(webhook, "waha_api_dispatcher", return_value=waha_says("WORKING")):
            webhook.handle_session_status_event(event(name, "STARTING"))
        self.assertEqual(frappe.db.get_value("WhatsApp Session", name, "status"), "WORKING")

    def test_the_reported_status_is_used_when_waha_cannot_be_asked(self):
        name = self.make_session()
        with patch.object(webhook, "waha_api_dispatcher", return_value=None):
            webhook.handle_session_status_event(event(name, "SCAN_QR_CODE"))
        self.assertEqual(frappe.db.get_value("WhatsApp Session", name, "status"), "SCAN_QR_CODE")

    def test_qr_link_and_account_are_stored(self):
        name = self.make_session()
        me = {"id": "919900000099@c.us", "pushName": "Demo"}
        with patch.object(webhook, "waha_api_dispatcher", return_value=waha_says("WORKING")), patch.object(
            webhook, "is_chat_available", return_value=True
        ), patch.object(webhook, "ensure_contact_record"):
            webhook.handle_session_status_event(event(name, "WORKING", me))
        row = frappe.db.get_value("WhatsApp Session", name, ["user_id", "user_name", "qr_image_link"], as_dict=True)
        self.assertEqual((row.user_id, row.user_name), ("919900000099@c.us", "Demo"))
        self.assertTrue(row.qr_image_link.startswith(f"/api/{name}/auth/qr"))

    def test_an_unknown_session_is_created(self):
        with patch.object(webhook, "waha_api_dispatcher", return_value=waha_says("SCAN_QR_CODE")):
            webhook.handle_session_status_event(event("brand-new-session", "STARTING"))
        self.assertEqual(frappe.db.get_value("WhatsApp Session", {"session_id": "brand-new-session"}, "status"), "SCAN_QR_CODE")
