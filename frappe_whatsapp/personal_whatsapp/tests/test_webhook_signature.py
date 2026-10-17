import hashlib
import hmac
from unittest.mock import patch

from frappe.tests import IntegrationTestCase

from frappe_whatsapp.personal_whatsapp.api import webhook

BODY = b'{"event": "message"}'
SECRET = "s3cret"


def sign(body, secret):
    return hmac.new(secret.encode(), body, hashlib.sha512).hexdigest()


class TestWebhookSignature(IntegrationTestCase):
    @patch.object(webhook, "get_webhook_secret", return_value=None)
    def test_no_secret_rejects_everything(self, _):
        self.assertFalse(webhook.is_valid_signature(BODY, None))
        self.assertFalse(webhook.is_valid_signature(BODY, sign(BODY, SECRET)))

    @patch.object(webhook, "get_webhook_secret", return_value=SECRET)
    def test_valid_signature(self, _):
        self.assertTrue(webhook.is_valid_signature(BODY, sign(BODY, SECRET)))

    @patch.object(webhook, "get_webhook_secret", return_value=SECRET)
    def test_missing_or_wrong_signature_rejected(self, _):
        self.assertFalse(webhook.is_valid_signature(BODY, None))
        self.assertFalse(webhook.is_valid_signature(BODY, sign(BODY, "other")))
        self.assertFalse(webhook.is_valid_signature(b"{}", sign(BODY, SECRET)))
