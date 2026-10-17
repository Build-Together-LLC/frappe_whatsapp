from unittest.mock import MagicMock, patch

import frappe
from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat import whatsapp_chat
from frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat.whatsapp_chat import create_whatsapp_group, extract_group_id

GROUP = "120363000000011@g.us"


def reply(body, ok=True):
    r = MagicMock(ok=ok)
    r.json.return_value = body
    return r


class TestExtractGroupId(IntegrationTestCase):
    def test_every_engine_shape(self):
        shapes = [
            {"gid": {"server": "g.us", "user": "120363000000011"}},
            {"gid": {"_serialized": GROUP}},
            {"id": GROUP},
            {"id": {"_serialized": GROUP}},
            {"JID": GROUP},
            {"jid": GROUP},
            {"groupMetadata": {"id": GROUP}},
            {"gid": GROUP},
        ]
        for body in shapes:
            with self.subTest(body=body):
                self.assertEqual(extract_group_id(body), GROUP)

    def test_replies_without_a_group_id(self):
        for body in ({}, None, [], "x", {"id": "919900000011@c.us"}, {"id": ""}, {"gid": {}}):
            with self.subTest(body=body):
                self.assertIsNone(extract_group_id(body))


class TestCreateGroup(IntegrationTestCase):
    def create(self, dispatcher):
        with patch.object(whatsapp_chat, "waha_api_dispatcher", side_effect=dispatcher):
            return create_whatsapp_group("Team", '["919900000011@c.us", "919900000012@c.us"]', "default")

    def test_id_from_the_create_reply(self):
        calls = []

        def dispatcher(method, url, payload=None, **kw):
            calls.append((method, url))
            return reply({"id": GROUP})

        self.assertEqual(self.create(dispatcher), {"result": GROUP})
        self.assertEqual(calls, [("POST", "/api/default/groups")])

    def test_falls_back_to_the_group_list_when_the_reply_has_no_id(self):
        def dispatcher(method, url, payload=None, **kw):
            if method == "POST":
                return reply({"status": "created"})
            return reply([{"id": "120363999999999@g.us", "subject": "Other"}, {"id": GROUP, "subject": "Team"}])

        self.assertEqual(self.create(dispatcher), {"result": GROUP})

    def test_clear_error_when_the_group_cannot_be_found(self):
        def dispatcher(method, url, payload=None, **kw):
            return reply({"status": "created"} if method == "POST" else [])

        with patch.object(whatsapp_chat.frappe, "throw", side_effect=frappe.ValidationError) as throw:
            self.assertRaises(frappe.ValidationError, self.create, dispatcher)
            self.assertIn("did not return its id", throw.call_args.args[0])

    def test_waha_failure_is_reported(self):
        with patch.object(whatsapp_chat.frappe, "throw", side_effect=frappe.ValidationError):
            self.assertRaises(frappe.ValidationError, self.create, lambda *a, **k: reply({}, ok=False))
