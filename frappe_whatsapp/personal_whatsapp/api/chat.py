import frappe

from frappe_whatsapp.personal_whatsapp.api.groups_and_contacts import (
    is_group_contact_access_available,
)
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message.whatsapp_chat_message import (
    mark_as_seen,
    send_personal_whatsapp_message,
)
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session import (
    get_assigned_session,
)

MESSAGE_FIELDS = [
    "name",
    "creation",
    "type",
    "status",
    "message_type",
    "body",
    "caption",
    "media_url",
    "file_name",
    "mime_type",
    "user_id",
    "group_id",
    "error",
]


def ensure_chat_access(chat_id, session):
    if not is_group_contact_access_available(chat_id, session):
        raise frappe.PermissionError("You are not allowed to access this chat")


@frappe.whitelist()
def get_sessions():
    return get_assigned_session()


@frappe.whitelist()
def get_messages(chat_id: str, session: str, limit: int = 100):
    ensure_chat_access(chat_id, session)
    is_group = chat_id.endswith("@g.us")
    rows = frappe.get_all(
        "WhatsApp Chat Message",
        filters={
            "session": session,
            "group_id" if is_group else "user_id": chat_id,
            "conversation_type": "Group" if is_group else "Personal",
        },
        fields=MESSAGE_FIELDS,
        order_by="creation desc",
        limit=int(limit),
    )
    return rows[::-1]


@frappe.whitelist()
def send_message(chat_id: str, session: str, body: str):
    ensure_chat_access(chat_id, session)
    if not (body or "").strip():
        frappe.throw("Message cannot be empty")
    send_personal_whatsapp_message(chat_id, session, body.strip())
    return True


@frappe.whitelist()
def mark_chat_read(chat_id: str, session: str):
    ensure_chat_access(chat_id, session)
    chat_field = "group_id" if chat_id.endswith("@g.us") else "user_id"
    unread = frappe.get_all(
        "WhatsApp Chat Message",
        filters={"session": session, "status": "Received", chat_field: chat_id},
        pluck="name",
    )
    for name in unread:
        mark_as_seen(name, session)
    return len(unread)
