import frappe
from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp import config

FIELDS = ("waha_host", "waha_api_key", "waha_webhook_secret", "waha_webhook_base_url")
CONF_KEYS = ("waha_host", "waha_api_key", "waha_webhook_secret", "host_name")


class TestWahaConfig(IntegrationTestCase):
    def setUp(self):
        self.clear_settings()
        self.saved_conf = {k: frappe.conf.get(k) for k in CONF_KEYS}
        for k in CONF_KEYS:
            frappe.conf.pop(k, None)

    def tearDown(self):
        self.clear_settings()
        for k, v in self.saved_conf.items():
            if v is None:
                frappe.conf.pop(k, None)
            else:
                frappe.conf[k] = v
        frappe.db.rollback()
        frappe.clear_document_cache("WhatsApp Settings", "WhatsApp Settings")

    def clear_settings(self):
        settings = frappe.get_single("WhatsApp Settings")
        for f in FIELDS:
            settings.set(f, "")
        settings.save(ignore_permissions=True)

    def set_settings(self, **values):
        settings = frappe.get_single("WhatsApp Settings")
        for k, v in values.items():
            settings.set(k, v)
        settings.save(ignore_permissions=True)

    def test_empty_everywhere(self):
        self.assertEqual(config.get_waha_host(), "")
        self.assertFalse(config.get_waha_api_key())
        self.assertFalse(config.get_webhook_secret())

    def test_site_config_fallback(self):
        frappe.conf.update(
            waha_host="http://conf-host:3000/", waha_api_key="conf-key", waha_webhook_secret="conf-secret"
        )
        self.assertEqual(config.get_waha_host(), "http://conf-host:3000")
        self.assertEqual(config.get_waha_api_key(), "conf-key")
        self.assertEqual(config.get_webhook_secret(), "conf-secret")

    def test_settings_value_used(self):
        self.set_settings(waha_host="http://set-host:3000/", waha_api_key="set-key", waha_webhook_secret="set-secret")
        self.assertEqual(config.get_waha_host(), "http://set-host:3000")
        self.assertEqual(config.get_waha_api_key(), "set-key")
        self.assertEqual(config.get_webhook_secret(), "set-secret")

    def test_settings_win_over_site_config(self):
        frappe.conf.update(waha_host="http://conf-host", waha_api_key="conf-key")
        self.set_settings(waha_host="http://set-host", waha_api_key="set-key")
        self.assertEqual(config.get_waha_host(), "http://set-host")
        self.assertEqual(config.get_waha_api_key(), "set-key")

    def test_partial_settings_fall_back_per_field(self):
        frappe.conf.update(waha_host="http://conf-host", waha_api_key="conf-key", waha_webhook_secret="conf-secret")
        self.set_settings(waha_api_key="set-key")
        self.assertEqual(config.get_waha_host(), "http://conf-host")
        self.assertEqual(config.get_waha_api_key(), "set-key")
        self.assertEqual(config.get_webhook_secret(), "conf-secret")

    def test_webhook_base_url_order(self):
        frappe.conf.update(host_name="http://conf-url/")
        self.assertEqual(config.get_webhook_base_url(), "http://conf-url")
        self.set_settings(waha_webhook_base_url="http://set-url/")
        self.assertEqual(config.get_webhook_base_url(), "http://set-url")
        self.set_settings(waha_webhook_base_url="")
        frappe.conf.pop("host_name")
        self.assertEqual(config.get_webhook_base_url(), frappe.utils.get_url().rstrip("/"))

    def test_secrets_are_stored_encrypted_and_masked(self):
        self.set_settings(waha_api_key="set-key")
        stored = frappe.get_single("WhatsApp Settings").get("waha_api_key")
        self.assertNotIn("set-key", stored or "")
        self.assertEqual(config.get_waha_api_key(), "set-key")

    def test_non_admin_cannot_test_connection(self):
        from frappe_whatsapp.frappe_whatsapp.doctype.whatsapp_settings.whatsapp_settings import test_waha_connection

        with self.set_user("Guest"):
            self.assertRaises(frappe.PermissionError, test_waha_connection)
