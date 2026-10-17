import frappe

no_cache = 1


def get_context(context):
    if frappe.session.user == "Guest":
        frappe.local.flags.redirect_location = "/login?redirect-to=/whatsapp"
        raise frappe.Redirect

    context.csrf_token = frappe.sessions.get_csrf_token()
    context.no_header = 1
    context.no_breadcrumbs = 1
    context.show_sidebar = False
