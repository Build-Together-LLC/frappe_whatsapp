# Copyright (c) 2022, Shridhar Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class WhatsAppSettings(Document):
	pass


@frappe.whitelist()
def test_waha_connection():
	frappe.only_for("System Manager")

	from frappe_whatsapp.personal_whatsapp.config import get_waha_host
	from frappe_whatsapp.personal_whatsapp.utils import waha_api_dispatcher

	if not get_waha_host():
		return {"ok": False, "message": frappe._("WAHA Host is not set.")}

	response = waha_api_dispatcher("GET", "/api/sessions", timeout=10)
	if response is None:
		return {"ok": False, "message": frappe._("Could not reach the WAHA server. See the Error Log.")}
	if response.status_code in (401, 403):
		return {"ok": False, "message": frappe._("WAHA rejected the API key.")}
	if not response.ok:
		return {"ok": False, "message": frappe._("WAHA returned {0}.").format(response.status_code)}
	return {"ok": True, "message": frappe._("Connected to WAHA.")}
