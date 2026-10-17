from unittest.mock import patch

from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp.api import webhook
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat.whatsapp_chat import to_phone_number

LID = "250053180522617@lid"
PHONE_JID = "916291153739@c.us"


def incoming(body="Hello", **overrides):
    payload = {
        "id": f"false_{LID}_AC60F15DD17786B8DB24EF89E3A509E9",
        "from": LID,
        "fromMe": False,
        "body": body,
        "hasMedia": False,
        "media": None,
        "ack": 2,
        "ackName": "DEVICE",
        "replyTo": None,
        "_data": {
            "key": {
                "remoteJid": LID,
                "remoteJidAlt": "916291153739@s.whatsapp.net",
                "fromMe": False,
                "id": "AC60F15DD17786B8DB24EF89E3A509E9",
            },
            "message": {"conversation": body},
        },
    }
    payload.update(overrides)
    return payload


class TestMessagePayload(IntegrationTestCase):
    def test_message_id_from_key(self):
        self.assertEqual(webhook.get_message_id(incoming()), "AC60F15DD17786B8DB24EF89E3A509E9")

    def test_message_id_from_legacy_shape(self):
        payload = {"id": "true_x@c.us_ABC", "_data": {"id": {"id": "LEGACY1"}}}
        self.assertEqual(webhook.get_message_id(payload), "LEGACY1")

    def test_message_id_from_ack_payload_without_data(self):
        self.assertEqual(webhook.get_message_id({"id": "true_917903589277@c.us_3EB0AB12"}), "3EB0AB12")

    def test_lid_resolves_to_phone_jid_without_api_call(self):
        with patch.object(webhook, "resolve_lid") as resolve_lid:
            self.assertEqual(webhook.resolve_chat_address(LID, incoming(), "default"), PHONE_JID)
            resolve_lid.assert_not_called()

    def test_lid_without_alternate_falls_back_to_api(self):
        payload = incoming()
        payload["_data"]["key"].pop("remoteJidAlt")
        with patch.object(webhook, "resolve_lid", return_value=PHONE_JID) as resolve_lid:
            self.assertEqual(webhook.resolve_chat_address(LID, payload, "default"), PHONE_JID)
            resolve_lid.assert_called_once()

    def test_phone_jid_passes_through(self):
        self.assertEqual(webhook.resolve_chat_address("917903589277@s.whatsapp.net", {}, "default"), "917903589277@c.us")

    def test_message_kind(self):
        self.assertEqual(webhook.get_message_kind(incoming()), "Text")
        self.assertIsNone(webhook.get_message_kind(incoming(body="")))
        for mimetype, kind in [("image/jpeg", "Image"), ("video/mp4", "Video"), ("audio/ogg; codecs=opus", "Audio"), ("application/pdf", "Document")]:
            payload = incoming(hasMedia=True, media={"mimetype": mimetype, "url": "http://localhost:3000/api/files/default/a"})
            self.assertEqual(webhook.get_message_kind(payload), kind)

    def test_quoted_message_id(self):
        self.assertEqual(webhook.get_quoted_message_id(incoming(replyTo={"id": "QUOTED1"})), "QUOTED1")
        self.assertIsNone(webhook.get_quoted_message_id(incoming()))

    def test_media_path_keeps_query(self):
        self.assertEqual(webhook.media_path("http://localhost:3000/api/files/default/a.jpg"), "/api/files/default/a.jpg")
        self.assertEqual(webhook.media_path("http://h:3000/api/files/a.jpg?x=1"), "/api/files/a.jpg?x=1")

    def test_ack_without_data_updates_nothing_and_does_not_fail(self):
        webhook.update_message_status({"payload": {"id": "true_x@c.us_NOSUCH", "ackName": "READ", "fromMe": True}})

    def test_phone_numbers_get_the_default_country_code(self):
        with patch("frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat.whatsapp_chat.get_default_country_code", return_value="91"):
            self.assertEqual(to_phone_number("6291153739"), "916291153739")
            self.assertEqual(to_phone_number("06291153739"), "916291153739")
            self.assertEqual(to_phone_number("+91 62911 53739"), "916291153739")
            self.assertEqual(to_phone_number("916291153739"), "916291153739")
            self.assertEqual(to_phone_number("916291153739@c.us"), "916291153739@c.us")
