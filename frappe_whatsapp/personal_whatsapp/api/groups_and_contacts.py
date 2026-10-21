from enum import Enum

import frappe

from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session import (
    check_is_system_manager,
)
from frappe_whatsapp.personal_whatsapp.security import (
    require_admin,
    require_session_access,
    valid_chat_id,
    valid_session,
)
from frappe_whatsapp.personal_whatsapp.utils import is_admin_user, waha_api_dispatcher


class OrderBy(Enum):
    ALL = "All"
    CONTACTS = "Contacts"
    GROUPS = "Groups"
    UNANSWERED = "Un Answered"


@frappe.whitelist()
def get_list(
    session: str,
    offset: int = 0,
    limit: int = 10,
    search: str = None,
    order_by: str = OrderBy.ALL.value,
    is_archived: bool = False,
    create_new_groups: bool = False,
):
    require_session_access(session)
    user = frappe.session.user
    query_data = {
        "session": session,
        "user": user,
        "limit": limit,
        "offset": offset,
        "search": f"%{search}%" if search else None,
    }

    is_system_manager = check_is_system_manager(user)
    session_doc = frappe.get_doc("WhatsApp Session", session)
    full_access = any(
        child.user_assign == user and child.all_access
        for child in session_doc.session_assign_to
    )

    type_filter = ""
    if order_by == OrderBy.CONTACTS.value or create_new_groups:
        type_filter = "AND c.type = 'Contact'"
    elif order_by == OrderBy.GROUPS.value:
        type_filter = "AND c.type = 'Group'"
    elif order_by == OrderBy.UNANSWERED.value:
        type_filter = "AND uc.unread_count > 0"

    access_conditions = ""
    if not (is_system_manager or user == "Administrator" or full_access):
        access_conditions = "LEFT JOIN `tabWhatsApp Contact Access` ca ON ca.parent = c.name AND ca.user_assign = %(user)s"

    search_conditions = ""
    if search:
        search_conditions = (
            "AND (c.chat_id LIKE %(search)s OR c.chat_name LIKE %(search)s)"
        )
    archived_filter = ""
    if is_archived:
        archived_filter = "AND ar.session_name IS NOT NULL"
    else:
        archived_filter = ""

    query = f"""
        SELECT 
            c.name, 
            c.chat_id, 
            c.chat_name,
            c.mark_as_read, 
            c.profile_picture,
            c.type as type,
            COALESCE(uc.unread_count, 0) AS unread_count,
            lm.message_type AS last_message_type,
            lm.message_body AS last_message_body,
            lm.message_time AS last_message_time,
            lm.type AS last_message_category,
            IF(ar.session_name IS NOT NULL, TRUE, FALSE) AS is_archived
        FROM `tabWhatsApp Chat` c
        LEFT JOIN `tabWhatsApp Unread Count` uc 
            ON uc.parent = c.name AND uc.session = %(session)s
        LEFT JOIN `tabWhatsApp Last Message` lm 
            ON lm.parent = c.name AND lm.session = %(session)s
        LEFT JOIN `tabWhatsApp Archived Chat` ar
            ON ar.parent = c.name AND ar.session_name = %(session)s
        {access_conditions}
        WHERE 1=1
            {"AND ca.user_assign = %(user)s" if access_conditions else ""}
            {search_conditions}
            {type_filter}
            {archived_filter}
        GROUP BY c.name 
        ORDER BY lm.message_time DESC, c.modified DESC
        LIMIT %(limit)s OFFSET %(offset)s;
    """

    data = frappe.db.sql(query, query_data, as_dict=True)
    return data


def is_group_contact_access_available(chat_id: str, session: str):
    doctype = "WhatsApp Chat"
    user = frappe.session.user
    is_system_manager = check_is_system_manager(user)
    try:
        contact_doc = frappe.get_doc(doctype, {"chat_id": chat_id})
    except frappe.DoesNotExistError:
        return False

    chat_assign_field = "chat_assign_to"
    chat_access = any(
        child.user_assign == user for child in getattr(contact_doc, chat_assign_field)
    )
    try:
        session_doc = frappe.get_doc("WhatsApp Session", session)
    except frappe.DoesNotExistError:
        return False

    session_has_access = any(
        child.user_assign == user for child in session_doc.session_assign_to
    )
    full_access = any(
        child.user_assign == user and child.all_access == True
        for child in session_doc.session_assign_to
    )
    if (
        is_system_manager
        or user == "Administrator"
        or (chat_access and session_has_access)
        or full_access
    ):
        return True
    return False


@frappe.whitelist()
def archive_user(chat_id: str, session: str):
    valid_session(session)
    valid_chat_id(chat_id)
    if not is_group_contact_access_available(chat_id, session):
        raise frappe.PermissionError("You are not allowed to archive this user")
    doctype_name = "WhatsApp Chat"
    chat_doc = frappe.get_doc(doctype_name, {"chat_id": chat_id})
    session_exists = any(
        child.session_name == session for child in chat_doc.archived_by
    )
    if session_exists:
        return "Session already exists in archived list"
    else:
        url = f"/api/{session}/chats/{chat_id}/archive"
        return waha_api_dispatcher("POST", url)


@frappe.whitelist()
def unarchive_user(chat_id: str, session: str):
    valid_session(session)
    valid_chat_id(chat_id)
    if not is_group_contact_access_available(chat_id, session):
        raise frappe.PermissionError("You are not allowed to un archive this user")
    doctype_name = "WhatsApp Chat"
    chat_doc = frappe.get_doc(doctype_name, chat_id)
    session_exists = any(
        child.session_name == session for child in chat_doc.archived_by
    )
    if session_exists:
        url = f"/api/{session}/chats/{chat_id}/unarchive"
        response = waha_api_dispatcher("POST", url)
        return response
    else:
        return "Session does not exists in archived list"


@frappe.whitelist()
def assign_user_to_contact(user: str, chat_id: str):
    require_admin()
    valid_chat_id(chat_id)
    doctype_name = "WhatsApp Chat"
    contact_doc = frappe.get_doc(doctype_name, chat_id)
    chat_assign_field = "chat_assign_to"
    user_data = frappe.db.get_value("User", user, ["full_name"], as_dict=True)
    user_exists = False
    for row in getattr(contact_doc, chat_assign_field):
        if row.user_assign == user:
            user_exists = True
            break
    if not user_exists:
        try:
            contact_doc.append(
                chat_assign_field,
                {"user_assign": user, "full_name": user_data["full_name"]},
            )
            contact_doc.save()
            frappe.db.commit()
        except Exception as e:
            return f"error assigning user to contact  {str(e)}"
        return f"User {user} has been assigned to {chat_id}"
    else:
        return f"User {user} has been already assigned to the contact {chat_id}"


@frappe.whitelist()
def un_assign_user_to_contact(user: str, chat_id: str):
    require_admin()
    valid_chat_id(chat_id)
    doctype_name = "WhatsApp Chat"
    contact_doc = frappe.get_doc(doctype_name, chat_id)
    chat_assign_field = "chat_assign_to"
    user_exists = False
    for row in getattr(contact_doc, chat_assign_field):
        if row.user_assign == user:
            user_exists = True
            break
    if not user_exists:
        return f"User Doesn't exist in contact: {chat_id}"
    else:
        try:
            removed = False
            for row in getattr(contact_doc, chat_assign_field):
                if row.user_assign == user:
                    contact_doc.remove(row)
                    removed = True
                    break
            if removed:
                contact_doc.save()
                frappe.db.commit()
                return f"User {user} has been removed from the chat Id : {chat_id}"
        except Exception as e:
            return f"error assigning user to contact  {str(e)}"


CHAT_DETAIL_FIELDS = ("name", "chat_id", "chat_name", "profile_picture", "type", "mark_as_read")


@frappe.whitelist()
def get_detail(chat_id: str, session: str):
    valid_session(session)
    valid_chat_id(chat_id)
    doctype_name = "WhatsApp Chat"
    user = frappe.session.user
    is_system_manager = check_is_system_manager(user)
    session_doc = frappe.get_doc("WhatsApp Session", session)
    full_access = any(
        child.user_assign == user and child.all_access == True
        for child in session_doc.session_assign_to
    )
    try:
        contact_doc = frappe.get_doc(doctype_name, chat_id)
    except frappe.DoesNotExistError:
        return
    except Exception as e:
        frappe.log_error(message=str(e), title="Error in get_detail")
        return

    chat_assign_field = "chat_assign_to"

    if not hasattr(contact_doc, chat_assign_field):
        return

    chat_access = any(
        child.user_assign == user
        for child in getattr(contact_doc, chat_assign_field, [])
    )
    session_has_access = any(
        child.user_assign == user for child in session_doc.session_assign_to
    )
    if (
        is_system_manager
        or user == "Administrator"
        or (chat_access and session_has_access)
        or full_access
    ):
        return {
            **{field: contact_doc.get(field) for field in CHAT_DETAIL_FIELDS},
            "chat_assign_to": [row.as_dict() for row in contact_doc.chat_assign_to],
            "members": [row.as_dict() for row in contact_doc.members],
        }
    else:
        return f"You don't have access {user} to this contact."


@frappe.whitelist()
def Mark_as_read_conditional(chat_id: str, mark_as_read: bool):
    valid_chat_id(chat_id)
    doctype_name = "WhatsApp Chat"
    chat_doc = frappe.get_doc(doctype_name, {"chat_id": chat_id})
    if not (
        is_admin_user()
        or any(row.user_assign == frappe.session.user for row in chat_doc.chat_assign_to)
    ):
        raise frappe.PermissionError("You are not allowed to change this chat")
    chat_doc.mark_as_read = frappe.parse_json(mark_as_read) if isinstance(mark_as_read, str) else mark_as_read
    chat_doc.save(ignore_permissions=True)
    frappe.db.commit()

    return chat_doc
