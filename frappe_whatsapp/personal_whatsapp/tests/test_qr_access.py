from unittest.mock import patch

import frappe
from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session import whatsapp_session
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session import get_qr_code


class TestQrAccess(IntegrationTestCase):
    def test_paths_other_than_the_qr_endpoint_are_rejected(self):
        for url in [
            "/api/sessions",
            "/api/default/chats",
            "/api/default/auth/qr/../../sessions",
            "@evil.example/api/default/auth/qr",
            "//evil.example/api/default/auth/qr",
            "http://evil.example/api/default/auth/qr",
            "/api/default/auth/qr?x=1\\nHost: evil",
            "",
        ]:
            with self.subTest(url=url):
                self.assertRaises(frappe.ValidationError, get_qr_code, url)

    def test_the_link_the_webhook_stores_is_accepted(self):
        class Reply:
            status_code = 200
            ok = True
            content = b"png"
            headers = {"Content-Type": "image/png"}

            def json(self):
                return {"status": "SCAN_QR_CODE"}

        link = "/api/default/auth/qr?t = 2026-10-18 01:02:01.612391"
        with patch.object(whatsapp_session, "get_waha_host", return_value="http://waha.test:3000"), patch.object(
            whatsapp_session.requests, "get", return_value=Reply()
        ) as get:
            get_qr_code(link)
            self.assertEqual(get.call_args.args[0], "http://waha.test:3000" + link)

    def test_user_without_access_is_refused(self):
        with patch.object(whatsapp_session, "is_admin_user", return_value=False):
            with self.set_user("Guest"):
                self.assertRaises(frappe.PermissionError, get_qr_code, "/api/nosuchsession/auth/qr")

    def test_admin_request_goes_to_the_configured_host_only(self):
        class Reply:
            status_code = 200
            ok = True
            content = b"png"
            headers = {"Content-Type": "image/png"}

            def json(self):
                return {"status": "SCAN_QR_CODE"}

        with patch.object(whatsapp_session, "get_waha_host", return_value="http://waha.test:3000"), patch.object(
            whatsapp_session.requests, "get", return_value=Reply()
        ) as get:
            get_qr_code("/api/default/auth/qr?t=1")
            self.assertEqual(get.call_args.args[0], "http://waha.test:3000/api/default/auth/qr?t=1")

    def test_no_wait_when_the_session_has_no_qr_to_give(self):
        class Working:
            status_code = 200
            ok = True

            def json(self):
                return {"status": "WORKING"}

        with patch.object(whatsapp_session, "get_waha_host", return_value="http://waha.test:3000"), patch.object(
            whatsapp_session.requests, "get", return_value=Working()
        ) as get:
            self.assertRaises(frappe.ValidationError, get_qr_code, "/api/default/auth/qr?t = 2026-10-18 01:02:01.612391")
            self.assertEqual(get.call_count, 1)
