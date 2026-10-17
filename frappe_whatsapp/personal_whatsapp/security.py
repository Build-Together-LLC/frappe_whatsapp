import re

import frappe

from frappe_whatsapp.personal_whatsapp.utils import is_admin_user

SESSION_NAME = re.compile(r"^[A-Za-z0-9_ -]{1,140}$")
CHAT_ID = re.compile(r"^[A-Za-z0-9._-]{1,64}@(c\.us|g\.us|lid)$")


def valid_session(session):
    if not isinstance(session, str) or not SESSION_NAME.match(session):
        frappe.throw("Invalid session", frappe.ValidationError)
    return session


def valid_chat_id(chat_id):
    if not isinstance(chat_id, str) or not CHAT_ID.match(chat_id):
        frappe.throw("Invalid chat id", frappe.ValidationError)
    return chat_id


def has_session_access(session, user=None):
    user = user or frappe.session.user
    return bool(
        is_admin_user(user)
        or frappe.db.exists(
            "WhatsApp Session Access",
            {"parent": session, "parenttype": "WhatsApp Session", "user_assign": user},
        )
    )


def require_session_access(session):
    valid_session(session)
    if not has_session_access(session):
        frappe.throw("You are not allowed to use this session", frappe.PermissionError)


def require_admin():
    if not is_admin_user():
        frappe.throw("Only a System Manager can do this", frappe.PermissionError)
