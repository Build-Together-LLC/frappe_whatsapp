import re

import frappe
from frappe.utils.password import get_decrypted_password

SETTINGS = "WhatsApp Settings"


def _from_settings(fieldname):
    return frappe.get_cached_doc(SETTINGS).get(fieldname)


def _secret_from_settings(fieldname):
    return get_decrypted_password(SETTINGS, SETTINGS, fieldname, raise_exception=False)


def get_waha_host():
    return (_from_settings("waha_host") or frappe.conf.get("waha_host") or "").rstrip("/")


def get_waha_api_key():
    return _secret_from_settings("waha_api_key") or frappe.conf.get("waha_api_key")


def get_webhook_secret():
    return _secret_from_settings("waha_webhook_secret") or frappe.conf.get("waha_webhook_secret")


def get_webhook_base_url():
    return (
        _from_settings("waha_webhook_base_url")
        or frappe.conf.get("host_name")
        or frappe.conf.get("localhost_name")
        or frappe.utils.get_url()
    ).rstrip("/")


def get_default_country_code():
    return re.sub(
        r"\D",
        "",
        str(_from_settings("waha_default_country_code") or frappe.conf.get("waha_default_country_code") or "91"),
    )
