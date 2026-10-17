from unittest.mock import MagicMock, patch

import frappe
from frappe.tests import IntegrationTestCase

from frappe_whatsapp.patches import make_whatsapp_media_private

SCOPE = {"WhatsApp Chat Message": {"name": "-"}}


class TestMediaPrivacy(IntegrationTestCase):
    def make_chat(self, picture):
        return frappe.get_doc(
            {"doctype": "WhatsApp Chat", "chat_id": f"t{frappe.generate_hash(length=10)}@c.us", "chat_name": "Privacy Test", "type": "Contact", "profile_picture": picture}
        ).insert(ignore_permissions=True)

    def test_public_media_is_made_private_and_references_follow(self):
        chat = self.make_chat("/files/privacy-test.png")
        file_doc = MagicMock(file_url="/private/files/privacy-test.png", is_private=0)
        scope = {**SCOPE, "WhatsApp Chat": {"name": chat.name}}
        with patch.object(make_whatsapp_media_private, "public_file", return_value=file_doc):
            make_whatsapp_media_private.make_private(scope)

        self.assertEqual(file_doc.is_private, 1)
        file_doc.save.assert_called_once()
        self.assertEqual(frappe.db.get_value("WhatsApp Chat", chat.name, "profile_picture"), "/private/files/privacy-test.png")

    def test_missing_file_leaves_the_reference_alone(self):
        chat = self.make_chat("/files/not-a-file.png")
        scope = {**SCOPE, "WhatsApp Chat": {"name": chat.name}}
        with patch.object(make_whatsapp_media_private, "public_file", return_value=None):
            make_whatsapp_media_private.make_private(scope)
        self.assertEqual(frappe.db.get_value("WhatsApp Chat", chat.name, "profile_picture"), "/files/not-a-file.png")
