import frappe
from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp.api import chat
from frappe_whatsapp.personal_whatsapp.api.groups_and_contacts import (
    is_group_contact_access_available,
)

SESSION = "test-session"
CHAT_ID = "919999999999@c.us"


class TestChatAccess(IntegrationTestCase):
    def test_unknown_chat_is_not_accessible(self):
        self.assertIs(is_group_contact_access_available("0000@c.us", "missing"), False)

    def test_guest_cannot_read_messages(self):
        with self.set_user("Guest"):
            self.assertRaises(
                (frappe.PermissionError, frappe.DoesNotExistError),
                chat.get_messages,
                CHAT_ID,
                SESSION,
            )

    def test_empty_message_rejected(self):
        with patch_access():
            self.assertRaises(frappe.ValidationError, chat.send_message, CHAT_ID, SESSION, "   ")


def patch_access():
    from unittest.mock import patch

    return patch.object(chat, "is_group_contact_access_available", return_value=True)
