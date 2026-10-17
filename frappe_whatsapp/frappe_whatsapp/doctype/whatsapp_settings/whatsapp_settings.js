// Copyright (c) 2022, Shridhar Patil and contributors
// For license information, please see license.txt

frappe.ui.form.on('WhatsApp Settings', {
	test_waha_connection(frm) {
		frappe.call({
			method: 'frappe_whatsapp.frappe_whatsapp.doctype.whatsapp_settings.whatsapp_settings.test_waha_connection',
			freeze: true,
			freeze_message: __('Connecting to WAHA...'),
			callback(r) {
				frappe.msgprint({
					title: __('WAHA'),
					indicator: r.message.ok ? 'green' : 'red',
					message: r.message.message,
				});
			},
		});
	},
});
