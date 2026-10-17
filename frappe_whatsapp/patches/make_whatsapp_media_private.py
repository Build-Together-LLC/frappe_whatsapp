import frappe

TARGETS = (
    ("WhatsApp Chat Message", "media_url"),
    ("WhatsApp Chat", "profile_picture"),
)


def public_file(file_url):
    name = frappe.db.get_value("File", {"file_url": file_url, "is_private": 0})
    return frappe.get_doc("File", name) if name else None


def make_private(extra_filters=None):
    moved = {}
    for doctype, field in TARGETS:
        filters = {field: ("like", "/files/%"), **(extra_filters or {}).get(doctype, {})}
        for row in frappe.get_all(doctype, filters=filters, fields=["name", field]):
            old_url = row[field]
            if old_url not in moved:
                file_doc = public_file(old_url)
                if not file_doc:
                    continue
                file_doc.is_private = 1
                file_doc.save(ignore_permissions=True)
                moved[old_url] = file_doc.file_url
            frappe.db.set_value(doctype, row.name, field, moved[old_url], update_modified=False)


def execute():
    make_private()
