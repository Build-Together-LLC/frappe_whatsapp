// Copyright (c) 2026, Aman Kumar and contributors
// For license information, please see license.txt

frappe.ui.form.on('WhatsApp Session', {
  refresh: function(frm) {
    if (frm.doc.status === 'WORKING') {
      const btn = frm.add_custom_button('Logout', () => {
        frm
          .call({
            doc: frm.doc,
            method: 'logout',
            btn,
          })
          .then((m) => frm.refresh())
      })
    }
    if (frm.doc.status === 'STOPPED' || frm.doc.status === 'FAILED') {
      const btn = frm.add_custom_button('Start', () => {
        frm
          .call({
            doc: frm.doc,
            method: 'start',
            btn,
          })
          .then((m) => frm.refresh())
      })
    }
    if (frm.doc.status === 'SCAN_QR_CODE' || frm.doc.status === 'WORKING') {
      const btn = frm.add_custom_button('Stop', () => {
        frm
          .call({
            doc: frm.doc,
            method: 'stop',
            btn,
          })
          .then((m) => frm.refresh())
      })
    }
  },
})
