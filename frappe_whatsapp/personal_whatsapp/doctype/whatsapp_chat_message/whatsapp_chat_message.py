# Copyright (c) 2026, Aman Kumar and contributors
# For license information, please see license.txt

import json
import random
import time
from datetime import datetime

import frappe
from frappe.model.document import Document
from frappe.utils import now

from frappe_whatsapp.personal_whatsapp.api.webhook import (
    save_contact_by_session,
    save_group,
    is_chat_available,
    update_unread_count,
    update_last_message,
)
from frappe_whatsapp.personal_whatsapp.api.groups_and_contacts import (
    is_group_contact_access_available,
)
from frappe_whatsapp.personal_whatsapp.utils import waha_api_dispatcher


def format_options(data):
    ids = data.split(",")
    option_list = []
    for id_ in ids:
        trimmed_option = id_.strip()
        option_list.append(trimmed_option)

    return option_list


def format_whatsapp_id(number_or_id):
    if "@" not in number_or_id:
        if len(number_or_id) == 10:
            number_or_id = "91" + number_or_id
        number_or_id = number_or_id + "@c.us"
    return number_or_id


def format_whatsapp_group_id(group_or_id):
    if "@" not in group_or_id:
        group_or_id = group_or_id + "@g.us"
    return group_or_id


class WhatsAppChatMessage(Document):
    def validate(self):
        if self.message_id:
            existing_message_name = frappe.db.exists(
                "WhatsApp Chat Message",
                {
                    "session": self.session,
                    "message_id": self.message_id,
                    "user_id": self.user_id,
                },
            )
            if existing_message_name and existing_message_name != self.name:
                raise frappe.ValidationError("Message already exists")

    def before_save(self):
        if self.group_id:
            if not is_chat_available(self.group_id):
                save_group(self.session, self.group_id)
            self.group_id = format_whatsapp_group_id(self.group_id)
        if self.user_id:
            if not is_chat_available(self.user_id):
                save_contact_by_session(self.user_id, self.session)
            self.user_id = format_whatsapp_id(self.user_id)

    def after_insert(self):
        frappe.publish_realtime(
            "whatsapp_message",
            {
                "session": self.session,
                "chat_id": self.group_id or self.user_id,
                "name": self.name,
            },
            after_commit=True,
        )

    @frappe.whitelist()
    def send(self):
        url = None
        data = None
        chat_id = self.group_id if self.conversation_type == "Group" else self.user_id
        if self.message_type == "Text":
            start_typing_url = "/api/startTyping"
            stop_typing_url = "/api/stopTyping"
            typing_payload = json.dumps(
                {
                    "chatId": chat_id,
                    "session": self.session,
                }
            )
            url = "/api/sendText"
            data = json.dumps(
                {
                    "chatId": chat_id,
                    "text": self.body,
                    "session": self.session,
                }
            )
            length_body = len(self.body)
            time_per_letter = random.uniform(0.01, 0.02)
            wait_time = min(max(length_body * time_per_letter, 1), 3)
            waha_api_dispatcher("POST", start_typing_url, typing_payload)
            time.sleep(wait_time)
            waha_api_dispatcher("POST", stop_typing_url, typing_payload)

        elif self.message_type == "Poll":
            url = "/api/sendPoll"
            data = json.dumps(
                {
                    "chatId": chat_id,
                    "poll": {
                        "name": self.poll_name,
                        "options": format_options(self.options),
                        "multipleAnswers": self.multiple_answers,
                    },
                    "session": self.session_id,
                }
            )

        elif self.message_type == "Image":

            url = "/api/sendImage"
            data = json.dumps(
                {
                    "chatId": chat_id,
                    "file": {
                        "mimetype": self.mime_type,
                        "filename": self.file_name,
                        "url": self.media_url,
                    },
                    "caption": self.caption,
                    "session": self.session,
                }
            )

        elif self.message_type == "Video":

            url = "/api/sendVideo"
            data = json.dumps(
                {
                    "chatId": chat_id,
                    "file": {
                        "mimetype": self.mime_type,
                        "filename": self.file_name,
                        "url": self.media_url,
                    },
                    "caption": self.caption,
                    "session": self.session,
                }
            )

        elif self.message_type == "Audio":

            url = "/api/sendVoice"
            data = json.dumps(
                {
                    "chatId": chat_id,
                    "file": {
                        "mimetype": self.mime_type,
                        "url": self.media_url,
                    },
                    "session": self.session,
                }
            )

        elif self.message_type == "Document":

            url = "/api/sendFile"
            data = json.dumps(
                {
                    "chatId": chat_id,
                    "file": {
                        "mimetype": self.mime_type,
                        "filename": self.file_name,
                        "url": self.media_url,
                    },
                    "caption": self.caption,
                    "session": self.session,
                }
            )

        response = waha_api_dispatcher("POST", url, data).json()
        update_last_message(
            chat_id,
            self.session,
            self.message_type,
            "Outgoing",
            self.body if self.message_type == "Text" else None,
        )
        if not response.get("_data", {}).get("id", {}).get("id"):
            raise Exception(json.dumps(response))
        self.delete()
        return response["_data"]["id"]["id"]


def send_personal_whatsapp_message(chat_id: str, session_id: str, body: str):
    group_suffix = "@g.us"
    is_group = chat_id.endswith(group_suffix)
    session_user_id = frappe.db.get_value("WhatsApp Session", session_id, "user_id")
    recipient_group_id = chat_id if is_group else None
    recipient_user_id = session_user_id if is_group else chat_id

    # Document.insert() calls _validate_links() before before_save() runs, so
    # before_save()'s own "create the chat/group if missing" never gets a
    # chance to fire here - a first-ever message to a new contact or group
    # would otherwise fail link validation before it can create that record.
    if recipient_group_id and not is_chat_available(recipient_group_id):
        save_group(session_id, recipient_group_id)
    if recipient_user_id and not is_chat_available(recipient_user_id):
        save_contact_by_session(recipient_user_id, session_id)

    message_data = {
        "session": session_id,
        "body": body,
        "user_id": recipient_user_id,
        "type": "Outgoing",
        "group_id": recipient_group_id,
        "conversation_type": "Group" if is_group else "Personal",
        "message_type": "Text",
    }
    doc = frappe.new_doc("WhatsApp Chat Message")
    doc.update(message_data)
    doc.insert(ignore_permissions=True)
    doc.send()
    return True


@frappe.whitelist()
def mark_as_seen(name: str, session_id: str):
    message_doc = frappe.get_doc("WhatsApp Chat Message", name)
    conversation_type = message_doc.conversation_type
    chat_id = (
        message_doc.group_id if conversation_type == "Group" else message_doc.user_id
    )
    if not is_group_contact_access_available(chat_id, session_id):
        raise frappe.PermissionError(
            "You are not allowed to marked as seen this user message"
        )
    if message_doc.status != "Received":
        return False
    url = "/api/sendSeen"
    data = json.dumps(
        {
            "chatId": chat_id,
            "session": message_doc.session,
            "messageId": message_doc.message_id,
        }
    )
    waha_api_dispatcher("POST", url, data)
    message_doc.status = "Seen"
    message_doc.save(ignore_permissions=True)
    update_unread_count(chat_id, message_doc.session)
    return True


def send_scheduled_message():
    doc_type = "WhatsApp Chat Message"
    messages = frappe.get_all(
        doc_type, filters={"status": "Scheduled", "type": "Outgoing"}
    )
    current = now()
    current_datetime = datetime.strptime(current, "%Y-%m-%d %H:%M:%S.%f")
    for message in messages:
        message_doc = frappe.get_doc(doc_type, message.name)
        if message_doc.scheduled_at <= current_datetime:
            message_doc.status = "Unknown"
            message_doc.save()
            message_doc.send()


@frappe.whitelist()
def get_whatsapp_msg(chat_id, session):
    conversation_type = "Group" if chat_id.endswith("@g.us") else "Personal"
    if is_group_contact_access_available(chat_id, session):
        all_chat = frappe.get_all(
            "WhatsApp Chat Message",
            filters={
                "conversation_type": conversation_type,
                "session": session,
                "group_id" if conversation_type == "Group" else "user_id": chat_id,
            },
            fields=["*"],
            order_by="creation asc",
        )
        return all_chat
    raise frappe.PermissionError("You are not allowed to see this message")
