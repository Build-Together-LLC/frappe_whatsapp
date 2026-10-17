import frappe
import requests

from frappe_whatsapp.personal_whatsapp.config import get_waha_api_key, get_waha_host


def waha_api_dispatcher(method: str, url: str, payload=None, timeout: int = 30):
    if payload is None:
        payload = {}

    header = {
        "X-Api-Key": get_waha_api_key(),
        "accept": "*/*",
        "Content-Type": "application/json",
    }

    full_url = f"{get_waha_host()}{url}"
    try:
        res = requests.request(
            method, full_url, headers=header, data=payload, timeout=timeout
        )
    except requests.RequestException:
        frappe.log_error(
            title="WAHA API request failed",
            message=f"{method} {full_url}\n\n{frappe.get_traceback()}",
        )
        return None
    return res


def is_admin_user(user_id=None):
    user_id = user_id or frappe.session.user
    if user_id == "Administrator":
        return True
    return "System Manager" in frappe.get_roles(user_id)
