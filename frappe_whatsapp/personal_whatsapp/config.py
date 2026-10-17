import frappe


def get_waha_host():
    return (frappe.conf.get("waha_host") or "").rstrip("/")


def get_waha_api_key():
    return frappe.conf.get("waha_api_key")


def get_webhook_secret():
    return frappe.conf.get("waha_webhook_secret")


def get_webhook_base_url():
    return (
        frappe.conf.get("host_name")
        or frappe.conf.get("localhost_name")
        or frappe.utils.get_url()
    )
