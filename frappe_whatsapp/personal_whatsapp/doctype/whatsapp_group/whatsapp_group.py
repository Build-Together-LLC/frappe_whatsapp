# Copyright (c) 2026, Aman Kumar and contributors
# For license information, please see license.txt
import json

import frappe
from frappe.model.document import Document

from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message.whatsapp_chat_message import (
    format_whatsapp_group_id,
    format_whatsapp_id,
)
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session import (
    check_is_system_manager,
)
from frappe_whatsapp.personal_whatsapp.utils import waha_api_dispatcher


class WhatsAppGroup(Document):
    pass


@frappe.whitelist()
def create_whatsapp_group(group_name: str, group_members: str, session_id: str):
    url = f"/api/{session_id}/groups"

    participants = json.loads(group_members)

    new_participants = []
    for participant in participants:
        new_participants.append({"id": format_whatsapp_id(participant)})

    payload = json.dumps({"name": group_name, "participants": new_participants})

    response = waha_api_dispatcher("POST", url, payload).json()
    group_id = format_whatsapp_group_id(response["gid"]["user"])

    return {"result": group_id}


@frappe.whitelist()
def leave_whatsapp_group(group_id: str, session_id: str):
    user = frappe.session.user
    is_system_manager = check_is_system_manager(user)
    doctype_name = "WhatsApp Group"
    group_doc = frappe.get_doc(doctype_name, group_id)
    if (
        is_system_manager
        or user == "Administrator"
        or any(child.user_assign == user for child in group_doc.session_assign_to)
    ):
        response = waha_api_dispatcher(
            "POST", f"/api/{session_id}/groups/{group_id}/leave"
        )
        if response.ok:
            return {"result": response}
    else:
        return "you dont have permission to do this"
