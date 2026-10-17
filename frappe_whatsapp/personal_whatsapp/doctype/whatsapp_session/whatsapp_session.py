# Copyright (c) 2026, Aman Kumar and contributors
# For license information, please see license.txt
import json
import re

import frappe
import requests
from frappe.model.document import Document
from werkzeug.wrappers import Response

from frappe_whatsapp.personal_whatsapp.config import (
    get_waha_api_key,
    get_waha_host,
    get_webhook_secret,
    get_webhook_base_url,
)
from frappe_whatsapp.personal_whatsapp.security import require_admin, require_session_access, valid_session
from frappe_whatsapp.personal_whatsapp.utils import waha_api_dispatcher
from frappe_whatsapp.personal_whatsapp.utils import is_admin_user

WAHA_UNREACHABLE_MSG = (
    "Could not reach the WhatsApp (WAHA) server at {host}. "
    "Check the <b>WAHA Host</b> in WhatsApp Settings and that the server is running. "
    "See the <b>WAHA API request failed</b> Error Log for details."
)


def ensure_waha_response(response):
    if response is None:
        frappe.throw(WAHA_UNREACHABLE_MSG.format(host=get_waha_host()), title="WAHA Unreachable")
    return response


class WhatsAppSession(Document):
    def validate(self):
        if self.default:
            frappe.db.set_value("WhatsApp Session", {"default": 1}, "default", 0)

    def before_insert(self):
        session_count = frappe.db.count("WhatsApp Session")
        if session_count == 0:
            self.default = 1

    @frappe.whitelist()
    def logout(self):
        url = "/api/sessions/logout"
        payload = json.dumps({"name": self.name})
        response = ensure_waha_response(waha_api_dispatcher("POST", url, payload))
        if not response.ok:
            return response.text

    @frappe.whitelist()
    def start(self):
        if not get_webhook_secret():
            frappe.throw(
                "Set the Webhook Secret in WhatsApp Settings before starting a session."
            )
        url = "/api/sessions/start"
        webhook_url = (
            f"{get_webhook_base_url()}/api/method/frappe_whatsapp.personal_whatsapp.api.webhook.handle"
        )
        payload = json.dumps(
            {
                "name": self.name,
                "config": {
                    "proxy": None,
                    "noweb": {"store": {"enabled": True, "fullSync": True}},
                    "webhooks": [
                        {
                            "url": webhook_url,
                            "events": [
                                "session.status",
                                "message.any",
                                "message.ack",
                                "chat.archive",
                            ],
                            "hmac": {"key": get_webhook_secret()} if get_webhook_secret() else None,
                            "retries": None,
                            "customHeaders": None,
                        }
                    ],
                    "debug": False,
                },
            }
        )
        response = ensure_waha_response(waha_api_dispatcher("POST", url, payload))
        if not response.ok:
            return response.text

    @frappe.whitelist()
    def stop(self):
        url = "/api/sessions/stop"
        payload = json.dumps({"name": self.name})
        response = ensure_waha_response(waha_api_dispatcher("POST", url, payload))
        if not response.ok:
            return response.text


QR_PATH = re.compile(r"^/api/([A-Za-z0-9_-]+)/auth/qr(\?[A-Za-z0-9_=&.%+: -]*)?$")


@frappe.whitelist()
def get_qr_code(url: str):
    match = QR_PATH.match(url or "")
    if not match:
        frappe.throw("Invalid QR code path", frappe.ValidationError)

    require_session_access(match.group(1))

    headers = {
        "X-Api-Key": get_waha_api_key(),
        "Content-Type": "application/json",
    }
    try:
        response = requests.get(f"{get_waha_host()}{url}", headers=headers, timeout=15)
    except requests.RequestException:
        frappe.log_error(frappe.get_traceback(), "WhatsApp QR code")
        frappe.throw("Could not fetch the QR code from WAHA")
    if response.status_code != 200:
        frappe.throw(f"Failed to fetch image from WAHA. Status code: {response.status_code}")
    return Response(response.content, mimetype=response.headers.get("Content-Type"))


def get_session_present_in_local(local_session, server_session):
    reference_names = {entry["name"] for entry in local_session}
    result = []
    for entry in server_session:
        if entry["name"] in reference_names:
            result.append({"name": entry["name"], "status": entry["status"]})

    return result


def sync_whatsapp_session_with_waha():
    url = "/ping"
    response = waha_api_dispatcher("GET", url)
    if not response:
        return
    doc_type = "WhatsApp Session"
    local_sessions = frappe.get_all(doc_type)
    get_all_session_url = "/api/sessions"
    sessions_response = waha_api_dispatcher("GET", get_all_session_url)
    if not sessions_response or not sessions_response.ok:
        return
    session_in_server = sessions_response.json()
    filtered_sessions = get_session_present_in_local(local_sessions, session_in_server)
    for local_session in local_sessions:
        session_doc = frappe.get_doc(doc_type, local_session.name)
        local_sessions_status = session_doc.status
        session_server_status = next(
            (
                entry["status"]
                for entry in filtered_sessions
                if entry["name"] == local_session.name
            ),
            None,
        )
        running_state = {"WORKING", "STARTING", "SCAN_QR_CODE"}

        if local_sessions_status in running_state:
            if session_server_status in running_state:
                session_doc.status = session_server_status
            else:
                session_doc.start()
        else:
            if session_server_status in running_state:
                session_doc.status = session_server_status
        session_doc.save()


def check_is_system_manager(user):
    roles = frappe.get_roles(user)
    if "System Manager" in roles:
        return True
    else:
        return False


@frappe.whitelist()
def get_selected_session(session):
    valid_session(session)
    user = frappe.session.user
    is_system_manager = check_is_system_manager(user)

    session_data = frappe.get_doc("WhatsApp Session", session)

    if is_system_manager or user == "Administrator":
        return session_data

    if any(child.user_assign == user for child in session_data.session_assign_to):
        return session_data

    return None


@frappe.whitelist()
def get_assigned_session():
    user = frappe.session.user
    is_system_manager = check_is_system_manager(user)
    doctype_name = "WhatsApp Session"
    has_access = []
    all_sessions = frappe.get_all(
        doctype_name,
        fields=[
            "name",
            "session_id",
            "user_id",
            "user_name",
            "status",
            "qr_image_link",
            "default",
        ],
    )
    if is_system_manager or user == "Administrator":
        has_access = all_sessions
        return has_access
    for session in all_sessions:
        session_doc = frappe.get_doc(doctype_name, session.name)
        if any(child.user_assign == user for child in session_doc.session_assign_to):
            has_access.append(
                {
                    "name": session.name,
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "user_name": session.user_name,
                    "status": session.status,
                    "image_link": session.qr_image_link,
                }
            )
    return has_access


def get_session_present_in_local(local_session, server_session):
    reference_names = {entry["name"] for entry in local_session}
    result = []
    for entry in server_session:
        if entry["name"] in reference_names:
            result.append({"name": entry["name"], "status": entry["status"]})

    return result


@frappe.whitelist()
def assign_user_to_session(user, session, full_access=False):
    require_admin()
    session_doc = frappe.get_doc("WhatsApp Session", session)
    user_exists = False
    for row in session_doc.session_assign_to:
        if row.user_assign == user:
            user_exists = True
            break
    if not user_exists:
        try:
            session_doc.append(
                "session_assign_to",
                {
                    "user_assign": user,
                    "all_access": True if full_access else False,
                },
            )
            session_doc.save()
            frappe.db.commit()
        except Exception as e:
            return f"Failed to assign user to session: {str(e)}"
        return f"User {user} has been added to the session {session}"
    else:
        return f"User {user} has been already assigned to the session {session}"


@frappe.whitelist()
def un_assign_user_to_session(user, session):
    require_admin()
    session_doc = frappe.get_doc("WhatsApp Session", session)
    user_exists = False
    for row in session_doc.session_assign_to:
        if row.user_assign == user:
            user_exists = True
            break
    if not user_exists:
        return f"User {user} does not exist in the session {session}"
    else:
        try:
            removed = False
            for row in session_doc.session_assign_to:
                if row.user_assign == user:
                    session_doc.remove(row)
                    removed = True
                    break
            if removed:
                session_doc.save()
                frappe.db.commit()
                return f"User {user} has been removed from the session {session}"
            else:
                return f"Error while un-assigning user: {user}"
        except Exception as e:
            return f"Failed to un-assign user: {str(e)}"


@frappe.whitelist()
def start_session(doc_name):
    user = frappe.session.user
    session_doc = frappe.get_doc("WhatsApp Session", doc_name)
    if is_admin_user(user):
        session_doc.start()
        return f"Session {doc_name} has been started."
    for row in session_doc.session_assign_to:
        if row.user_assign == user:
            session_doc.start()
            return f"Session {doc_name} has been started."
    return f"you Dont Have access to this session {doc_name}."


@frappe.whitelist()
def create_session(session_name):
    user = frappe.session.user
    if not is_admin_user(user):
        return "you Dont Have access to create new session."
    data = {"session_id": session_name}
    doc = frappe.new_doc("WhatsApp Session")
    doc.update(data)
    doc.insert(ignore_permissions=True)
    doc.start()
    return f"Session {session_name} has been created."
