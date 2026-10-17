import hashlib
import hmac
import json
from datetime import datetime
from urllib.parse import urlparse

import frappe
import requests
from frappe.utils import now

from frappe_whatsapp.personal_whatsapp.config import get_webhook_secret
from frappe_whatsapp.personal_whatsapp.utils import waha_api_dispatcher

sent_status_map = {
    "PENDING": "Sent",
    "SERVER": "Sent",
    "DEVICE": "Delivered",
    "READ": "Read",
}

received_status_map = {
    "SERVER": "Received",
    "DEVICE": "Received",
    "READ": "Marked Read",
}


def handle_session_status_event(data):
    session_doctype = "WhatsApp Session"
    payload = data["payload"]

    record_name = frappe.db.get_value(
        session_doctype, {"name": data["session"]}, "name"
    )

    session_id = data["session"]
    me = data.get("me")
    if record_name:
        if not me:
            doc = frappe.get_doc(session_doctype, record_name)
            doc.update(
                {
                    "status": payload["status"],
                    "qr_image_link": f"/api/{session_id}/auth/qr?t = {datetime.now()}",
                }
            )
            doc.save(ignore_permissions=True)
        if me:
            push_name = me.get("pushName")
            if not is_chat_available(me["id"]):
                save_contact_by_session(me["id"], session_id, push_name)
            # user_id is a link to WhatsApp Contact, which the call above does not create.
            ensure_contact_record(me["id"], push_name)
            doc = frappe.get_doc(session_doctype, record_name)
            doc.update(
                {
                    "status": payload["status"],
                    "user_id": me["id"],
                    "user_name": push_name,
                    "qr_image_link": f"/api/{session_id}/auth/qr?t = {datetime.now()}",
                }
            )
            doc.save(ignore_permissions=True)

    else:
        # create new session
        session_data = {
            "status": payload["status"],
            "session_id": session_id,
            "qr_image_link": f"/api/{session_id}/auth/qr?t = {datetime.now()}",
        }
        doc = frappe.new_doc("WhatsApp Session")
        doc.update(session_data)
        doc.insert(ignore_permissions=True)


def download_media(url):
    parsed_url = urlparse(url)
    file_name = parsed_url.path.split("/")[-1]
    response = waha_api_dispatcher("GET", url)

    if response.status_code == 200:
        file_doc = frappe.get_doc(
            {
                "doctype": "File",
                "file_name": file_name,
                "content": response.content,
                "is_private": 1,
            }
        ).insert(ignore_permissions=True)
        return file_doc
    else:
        return


def download_profile_picture(url):
    parsed_url = urlparse(url)
    file_name = parsed_url.path.split("/")[-1]
    response = requests.request("GET", url)
    if response.status_code == 200:
        file_doc = frappe.get_doc(
            {
                "doctype": "File",
                "file_name": file_name,
                "content": response.content,
                "is_private": 1,
            }
        ).insert(ignore_permissions=True)
        return file_doc


def get_profile_picture(session: str, chat_id: str):
    url = f"/api/contacts/profile-picture?session={session}&contactId={chat_id}"
    response = waha_api_dispatcher("GET", url)
    # The dispatcher returns None when WAHA is unreachable. A missing avatar is
    # cosmetic and must not fail the webhook that is recording the session.
    if response is None or not response.ok:
        return None

    profile_picture_url = response.json().get("profilePictureURL")
    if profile_picture_url:
        try:
            return download_profile_picture(profile_picture_url)
        except Exception:
            frappe.log_error(frappe.get_traceback(), "WhatsApp profile picture")
            return None
    else:
        return None


def save_contact_by_session(user_id, session, fallback_name=None):
    if not user_id:
        return
    url = f"/api/contacts?contactId={user_id}&session={session}"
    response = waha_api_dispatcher("GET", url)
    contact_data = response.json() if response is not None and response.ok else {}

    # WAHA returns no name at all for the session's own number (isMe), and a
    # present-but-null "name" makes dict.get(key, default) hand back None rather
    # than the default - so take the first truthy candidate instead. chat_name is
    # mandatory and user_id is always set by here, so this cannot end up empty.
    user_name = (
        contact_data.get("name")
        or contact_data.get("pushname")
        or fallback_name
        or contact_data.get("number")
        or user_id
    )

    file_doc = get_profile_picture(session, user_id)

    data = {
        "chat_id": user_id,
        "chat_name": user_name,
        "profile_picture": file_doc.get("file_url") if file_doc else None,
        "type": "Contact",
    }

    doc = frappe.new_doc("WhatsApp Chat")
    doc.update(data)
    try:
        doc.insert(ignore_permissions=True)
    except frappe.DuplicateEntryError:
        pass


def save_group(session, group_id):
    if not group_id:
        return
    url = f"/api/{session}/groups/{group_id}"
    response = waha_api_dispatcher("GET", url)
    group_data = response.json()
    participants = []
    file_url = None
    file_doc = get_profile_picture(session, group_id)
    group_name = group_data.get("name")
    if file_doc:
        file_url = file_doc.file_url
    if not group_name:
        group_name = group_data.get("groupMetadata", {}).get("subject")
    members = []

    for participant in participants:
        tab = {"user": participant["id"]["user"], "is_admin": participant["isAdmin"]}
        members.append(tab)

    data = {
        "chat_id": group_id,
        "chat_name": group_name,
        "profile_picture": file_url,
        "members": members,
        "type": "Group",
    }
    doc = frappe.new_doc("WhatsApp Chat")
    doc.update(data)
    try:
        doc.insert(ignore_permissions=True)
    except frappe.DuplicateEntryError:
        pass


def is_chat_available(contact):
    contact_exists = frappe.db.exists("WhatsApp Chat", {"chat_id": contact})
    return contact_exists


def resolve_lid(chat_id, session):
    """Translate a WhatsApp LID address into the sender's phone-number JID.

    WhatsApp now addresses many senders by a "linked identity" (`<id>@lid`)
    rather than `<number>@c.us`. Everything downstream - the chat records, the
    funnel triggers, any phone-number matching - is keyed on the phone JID, and
    save_message_and_contact_and_group() drops anything that is neither @c.us nor
    @g.us on the floor. Resolving here lets the rest of the code keep its
    assumptions.

    Returns the input unchanged when it is not a LID, or when WAHA cannot resolve
    it - the caller then behaves exactly as it did before.
    """
    if not chat_id or not chat_id.endswith("@lid"):
        return chat_id

    response = waha_api_dispatcher("GET", f"/api/{session}/lids/{chat_id}")
    if response is None or not response.ok:
        frappe.log_error(
            f"Could not resolve LID {chat_id} on session {session}", "WhatsApp LID"
        )
        return chat_id

    return response.json().get("pn") or chat_id


def ensure_contact_record(user_id, user_name=None):
    """Make sure a WhatsApp Contact exists for `user_id`.

    WhatsApp Session.user_id links to WhatsApp Contact, but
    save_contact_by_session() creates a WhatsApp Chat - a different doctype. Nothing
    else creates the Contact, so on a fresh session store the first session.status
    event carrying `me` fails link validation.
    """
    if not user_id:
        return

    if frappe.db.exists("WhatsApp Contact", user_id):
        return

    doc = frappe.new_doc("WhatsApp Contact")
    doc.update({"user_id": user_id, "user_name": user_name or user_id})
    doc.insert(ignore_permissions=True)


def update_unread_count(chat_id, session_id):
    if not chat_id or not frappe.db.exists("WhatsApp Chat", chat_id):
        return

    for attempt in range(5):
        try:
            chat_doc = frappe.get_doc("WhatsApp Chat", chat_id)
            if attempt > 0:
                chat_doc.reload()
            entry_found = False
            filters = {"status": "Received"}

            if chat_id.endswith("@c.us"):
                filters["user_id"] = chat_id
            elif chat_id.endswith("@g.us"):
                filters["group_id"] = chat_id
            unread_message_count = frappe.db.count("WhatsApp Chat Message", filters)
            for entry in chat_doc.unread_count:
                if entry.session == session_id:
                    entry.unread_count = unread_message_count
                    entry_found = True
                    break
            if not entry_found:
                new_entry = {
                    "unread_count": unread_message_count,
                    "session": session_id,
                }
                chat_doc.append("unread_count", new_entry)
            chat_doc.save(ignore_permissions=True)
            frappe.db.commit()
            break
        except frappe.TimestampMismatchError:
            if attempt == 4:
                frappe.log_error(
                    frappe.get_traceback(), "update_unread_count TimestampMismatchError"
                )
            continue


def update_last_message(
    chat_id,
    session_id,
    message_type,
    send_type,
    message_body=None,
):
    if not chat_id or not frappe.db.exists("WhatsApp Chat", chat_id):
        return

    for attempt in range(5):
        try:
            chat_doc = frappe.get_doc("WhatsApp Chat", chat_id)
            if attempt > 0:
                chat_doc.reload()
            message_time = now()
            entry_found = False
            for entry in chat_doc.last_message:
                if entry.session == session_id:
                    entry.message_type = message_type
                    entry.message_body = message_body
                    entry.message_time = message_time
                    entry.type = send_type
                    entry_found = True
                    break
            if not entry_found:
                new_entry = {
                    "session": session_id,
                    "message_type": message_type,
                    "message_body": message_body,
                    "message_time": message_time,
                    "type": send_type,
                }
                chat_doc.append("last_message", new_entry)
            chat_doc.save(ignore_permissions=True)
            frappe.db.commit()
            break
        except frappe.TimestampMismatchError:
            if attempt == 4:
                frappe.log_error(
                    frappe.get_traceback(), "update_last_message TimestampMismatchError"
                )
            continue


def normalize_jid(address):
    if address and address.endswith("@s.whatsapp.net"):
        return address.replace("@s.whatsapp.net", "@c.us")
    return address


def get_message_key(payload):
    return (payload.get("_data") or {}).get("key") or {}


def get_message_id(payload):
    data = payload.get("_data") or {}
    return (
        get_message_key(payload).get("id")
        or (data.get("id") or {}).get("id")
        or str(payload.get("id") or "").split("_")[-1]
        or None
    )


def resolve_chat_address(address, payload, session_id):
    address = normalize_jid(address)
    if address and address.endswith("@lid"):
        alternate = normalize_jid(get_message_key(payload).get("remoteJidAlt"))
        if alternate and alternate.endswith("@c.us"):
            return alternate
    return resolve_lid(address, session_id)


def resolve_group_author(payload, session_id):
    data = payload.get("_data") or {}
    key = get_message_key(payload)
    author = normalize_jid(
        key.get("participantAlt")
        or key.get("participant")
        or payload.get("participant")
        or data.get("author")
    )
    return resolve_lid(author, session_id)


def get_message_kind(payload):
    media = payload.get("media")
    if payload.get("hasMedia") and media:
        mimetype = media.get("mimetype") or ""
        if mimetype.startswith("image/"):
            return "Image"
        if mimetype.startswith("video/"):
            return "Video"
        if mimetype.startswith("audio/"):
            return "Audio"
        return "Document"
    if payload.get("body"):
        return "Text"
    return None


def get_quoted_message_id(payload):
    reply_to = payload.get("replyTo") or {}
    return reply_to.get("id") or (payload.get("_data") or {}).get("quotedStanzaID")


def media_path(url):
    parsed = urlparse(url)
    return f"{parsed.path}?{parsed.query}" if parsed.query else parsed.path


def save_message_and_contact_and_group(data, msg_type, user_id):
    group_suffix = "@g.us"
    user_suffix = "@c.us"
    session_id = data["session"]
    payload = data["payload"]
    message_id = get_message_id(payload)
    kind = get_message_kind(payload)
    if not kind or not message_id:
        return
    if frappe.db.exists("WhatsApp Chat Message", {"message_id": message_id}):
        return

    quoted_msg_id = get_quoted_message_id(payload)
    if user_id.endswith(group_suffix) or user_id.endswith(user_suffix):
        if user_id.endswith(group_suffix):
            author = (
                frappe.get_doc("WhatsApp Session", session_id).user_id
                if msg_type == "Outgoing"
                else resolve_group_author(payload, session_id)
            )
            if not is_chat_available(user_id):
                save_group(session_id, user_id)
            if not is_chat_available(author):
                save_contact_by_session(author, session_id)
        elif user_id.endswith(user_suffix):
            if not is_chat_available(user_id):
                save_contact_by_session(user_id, session_id)

        ack_name = payload.get("ackName", "")
        message_status = (
            sent_status_map.get(ack_name, "Unknown")
            if msg_type == "Outgoing"
            else received_status_map.get(ack_name, "Unknown")
        )

        doc = frappe.new_doc("WhatsApp Chat Message")
        doc.update(
            {
                "message_id": message_id,
                "session": session_id,
                "group_id": user_id if user_id.endswith(group_suffix) else None,
                "user_id": author if user_id.endswith(group_suffix) else user_id,
                "type": msg_type,
                "conversation_type": (
                    "Group" if user_id.endswith(group_suffix) else "Personal"
                ),
                "status": message_status,
                "quoted_message_id": quoted_msg_id or None,
            }
        )
        if kind == "Text":
            message_data = {"body": payload["body"], "message_type": "Text"}
        else:
            media = payload["media"]
            file_doc = download_media(media_path(media["url"]))
            message_data = {
                "message_type": kind,
                "mime_type": media.get("mimetype"),
                "media_url": file_doc.file_url if file_doc else None,
            }
            if kind != "Audio":
                message_data["caption"] = payload.get("body")
                message_data["file_name"] = media.get("filename")

        doc.update(message_data)
        doc.insert(ignore_permissions=True)
        update_unread_count(user_id, session_id)
        update_last_message(
            user_id,
            session_id,
            kind,
            msg_type,
            payload["body"] if kind == "Text" else None,
        )
    else:
        # Anything not addressed as @c.us or @g.us is dropped here. That used to
        # be silent, which makes a missing message impossible to tell apart from
        # a message that never arrived.
        frappe.log_error(
            f"Ignored message {message_id} from unrecognised address {user_id} "
            f"on session {session_id}",
            "WhatsApp unhandled address",
        )


def handle_message_any_event(data):
    payload = data["payload"]
    session_id = data["session"]
    if payload.get("fromMe"):
        address = payload.get("to") or get_message_key(payload).get("remoteJid")
        msg_type = "Outgoing"
    else:
        address = payload.get("from") or get_message_key(payload).get("remoteJid")
        msg_type = "Incoming"
    user_id = resolve_chat_address(address, payload, session_id)
    if not user_id:
        return
    save_message_and_contact_and_group(data, msg_type, user_id)


def update_message_status(data):
    payload = data["payload"]
    ack_name = payload.get("ackName")
    message_id = get_message_id(payload)
    if not ack_name or not message_id:
        return
    name = frappe.db.exists("WhatsApp Chat Message", {"message_id": message_id})
    if not name:
        return
    wa_message = frappe.get_doc("WhatsApp Chat Message", name)
    wa_message.status = sent_status_map.get(ack_name, "Unknown")
    wa_message.save(ignore_permissions=True)


def handle_message_ack_event(data):
    if not data["payload"].get("fromMe"):
        return
    update_message_status(data)


def handle_chat_archive(data):
    session = data["session"]
    payload = data["payload"]
    chat_id = payload["id"]
    doctype_name = "WhatsApp Chat"
    if not frappe.db.exists(doctype_name, chat_id):
        return

    for attempt in range(5):
        try:
            chat_doc = frappe.get_doc(doctype_name, chat_id)
            if attempt > 0:
                chat_doc.reload()
            session_exists = any(
                child.session_name == session for child in chat_doc.archived_by
            )
            if payload["archived"]:
                if session_exists:
                    return "chat id is already archived"
                else:
                    chat_doc.append(
                        "archived_by",
                        {
                            "session_name": session,
                        },
                    )
            else:
                if session_exists:
                    chat_doc.archived_by = [
                        child for child in chat_doc.archived_by if child.session_name != session
                    ]
                else:
                    return "chat id is not archived"
            chat_doc.save(ignore_permissions=True)
            frappe.db.commit()
            break
        except frappe.TimestampMismatchError:
            if attempt == 4:
                frappe.log_error(
                    frappe.get_traceback(), "handle_chat_archive TimestampMismatchError"
                )
            continue


# frappe_whatsapp.personal_whatsapp.api.webhook.handle
def is_valid_signature(raw_body, signature):
    secret = get_webhook_secret()
    if not secret or not signature:
        return False
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(expected, signature)


@frappe.whitelist(allow_guest=True)
def handle(**kwargs):
    if not get_webhook_secret():
        frappe.throw("Webhook secret is not configured", frappe.AuthenticationError)
    signature = frappe.get_request_header("X-Webhook-Hmac")
    if not is_valid_signature(frappe.request.get_data(), signature):
        frappe.throw("Invalid webhook signature", frappe.AuthenticationError)
    try:
        log = frappe.new_doc("WhatsApp Webhook Log")
        log.update({"payload": json.dumps(kwargs, indent=2)})
        log.insert(ignore_permissions=True)
    except:
        pass
    event = kwargs.get("event")
    if not event:
        frappe.throw("Missing event", frappe.ValidationError)
    if event == "session.status":
        handle_session_status_event(kwargs)
    if event == "message.any":
        handle_message_any_event(kwargs)
    if event == "message.ack":
        handle_message_ack_event(kwargs)
    if event == "chat.archive":
        handle_chat_archive(kwargs)


def delete_old_webhook_logs():
    days = int(frappe.conf.get("waha_webhook_log_days") or 14)
    frappe.db.delete(
        "WhatsApp Webhook Log",
        {"creation": ("<", frappe.utils.add_days(frappe.utils.now(), -days))},
    )
