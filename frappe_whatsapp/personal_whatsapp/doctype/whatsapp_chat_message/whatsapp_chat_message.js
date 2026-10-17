// Copyright (c) 2026, Aman Kumar and contributors
// For license information, please see license.txt

frappe.ui.form.on("WhatsApp Chat Message", {
	refresh(frm) {
       if (frm.doc.type === "Outgoing" && !frm.doc.message_id) {
      const btn = frm.add_custom_button("Send Message", () => {
        frm
          .call({
            doc: frm.doc,
            method: "send",
            btn,
          })
          .then((m) => frm.refresh())
      })
    }
	},
});
