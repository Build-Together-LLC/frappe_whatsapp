# Copyright (c) 2026, Aman Kumar and contributors
# For license information, please see license.txt

import json
import re
from urllib.parse import quote

import frappe
from frappe.model.document import Document

from frappe_whatsapp.personal_whatsapp.api.webhook import save_contact_by_session
from frappe_whatsapp.personal_whatsapp.api.groups_and_contacts import (
    is_group_contact_access_available,
)
from frappe_whatsapp.personal_whatsapp.config import get_default_country_code
from frappe_whatsapp.personal_whatsapp.security import (
    require_session_access,
    valid_chat_id,
)
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message.whatsapp_chat_message import (
    format_whatsapp_group_id,
    format_whatsapp_id,
)
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session import (
    check_is_system_manager,
)
from frappe_whatsapp.personal_whatsapp.utils import waha_api_dispatcher


class WhatsAppChat(Document):
    pass


@frappe.whitelist()
def create_whatsapp_group(group_name: str, group_members: str, session_id: str):
    require_session_access(session_id)
    participants = frappe.parse_json(group_members)
    if not isinstance(participants, list) or not 0 < len(participants) <= 256:
        frappe.throw("Invalid group members", frappe.ValidationError)
    if not isinstance(group_name, str) or not group_name.strip():
        frappe.throw("Group name is required", frappe.ValidationError)

    new_participants = [{"id": valid_chat_id(format_whatsapp_id(str(p)))} for p in participants]
    payload = json.dumps({"name": group_name.strip()[:100], "participants": new_participants})

    response = waha_api_dispatcher("POST", f"/api/{quote(session_id, safe='')}/groups", payload)
    if response is None or not response.ok:
        frappe.throw("WAHA could not create the group")
    group_id = format_whatsapp_group_id(response.json()["gid"]["user"])

    return {"result": group_id}


@frappe.whitelist()
def leave_whatsapp_group(group_id: str, session_id: str):
    require_session_access(session_id)
    valid_chat_id(group_id)
    if not is_group_contact_access_available(group_id, session_id):
        raise frappe.PermissionError("You are not allowed to leave this group")
    response = waha_api_dispatcher(
        "POST", f"/api/{quote(session_id, safe='')}/groups/{quote(group_id, safe='')}/leave"
    )
    if response is not None and response.ok:
        return {"result": response.status_code}
    frappe.throw("WAHA could not leave the group")


@frappe.whitelist()
def create_whatsapp_contact(user_id: str, session: str):
    require_session_access(session)
    valid_chat_id(user_id)
    if not frappe.db.exists("WhatsApp Chat", {"chat_id": user_id}):
        save_contact_by_session(user_id, session)
        return 1
    return "Contact Already Exists"


def to_phone_number(raw: str):
    if "@" in raw:
        return raw
    digits = re.sub(r"\D", "", raw).lstrip("0")
    if len(digits) <= 10:
        digits = f"{get_default_country_code()}{digits}"
    return digits


@frappe.whitelist()
def get_whatsapp_contact(user_id: str, session: str):
    require_session_access(session)
    phone = to_phone_number(str(user_id))
    if not re.fullmatch(r"[0-9]{6,20}|[A-Za-z0-9._-]{1,64}@(c\.us|lid)", phone):
        frappe.throw("Invalid phone number", frappe.ValidationError)
    query = f"phone={quote(phone, safe='')}&session={quote(session, safe='')}"
    response = waha_api_dispatcher("GET", f"/api/contacts/check-exists?{query}")
    if response is None or not response.ok:
        frappe.throw("WAHA could not check this number")
    contact_data = response.json()
    if contact_data.get("numberExists"):
        contact_id = valid_chat_id(contact_data["chatId"])
        query = f"contactId={quote(contact_id, safe='')}&session={quote(session, safe='')}"
        response = waha_api_dispatcher("GET", f"/api/contacts?{query}")
        if response is None or not response.ok:
            frappe.throw("WAHA could not load this contact")
        return response.json()
    return contact_data
