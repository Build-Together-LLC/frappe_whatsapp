# Copyright (c) 2026, Aman Kumar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from frappe_whatsapp.personal_whatsapp.api.webhook import save_contact_by_session
from frappe_whatsapp.personal_whatsapp.utils import waha_api_dispatcher


class WhatsAppContact(Document):
    pass


@frappe.whitelist()
def create_whatsapp_contact(user_id: str, session: str):
    if not frappe.db.exists("WhatsApp Contact", {"user_id": user_id}):
        save_contact_by_session(user_id, session)
        return 1
    return "Contact Already Exists"


@frappe.whitelist()
def get_whatsapp_contact(user_id: str, session: str):
    url = f"/api/contacts/check-exists?phone={user_id}&session={session}"
    response = waha_api_dispatcher("GET", url)
    contact_data = response.json()
    if contact_data["numberExists"]:
        userId = contact_data["chatId"]
        url = f"/api/contacts?contactId={userId}&session={session}"
        response = waha_api_dispatcher("GET", url)
        user_data = response.json()
        return user_data
    else:
        return contact_data
