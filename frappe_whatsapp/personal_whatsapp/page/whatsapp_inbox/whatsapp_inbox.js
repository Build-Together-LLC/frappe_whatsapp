const API = "frappe_whatsapp.personal_whatsapp.api";

frappe.pages["whatsapp-inbox"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __("WhatsApp Inbox"),
    single_column: true,
  });
  new WhatsAppInbox(page);
};

class WhatsAppInbox {
  constructor(page) {
    this.page = page;
    this.session = null;
    this.chat = null;
    this.render();
    this.bind_realtime();
    this.load_sessions();
  }

  render() {
    $(this.page.main).html(`
      <div class="wa-inbox">
        <div class="wa-side">
          <div class="wa-session-field"></div>
          <input class="form-control wa-search" placeholder="${__("Search chats")}">
          <div class="wa-chats"></div>
        </div>
        <div class="wa-main">
          <div class="wa-head text-muted">${__("Select a chat")}</div>
          <div class="wa-messages"></div>
          <div class="wa-compose">
            <input class="form-control wa-input" placeholder="${__("Type a message")}" disabled>
            <button class="btn btn-primary btn-sm wa-send" disabled>${__("Send")}</button>
          </div>
        </div>
      </div>
      <style>
        .wa-inbox { display: flex; height: calc(100vh - 170px); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); overflow: hidden; }
        .wa-side { width: 320px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; padding: var(--padding-sm); gap: var(--margin-sm); }
        .wa-chats { overflow-y: auto; flex: 1; }
        .wa-chat { padding: var(--padding-sm); cursor: pointer; border-radius: var(--border-radius); }
        .wa-chat:hover, .wa-chat.active { background: var(--control-bg); }
        .wa-chat-name { font-weight: 500; display: flex; justify-content: space-between; }
        .wa-chat-last { font-size: var(--text-sm); color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wa-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .wa-head { padding: var(--padding-md); border-bottom: 1px solid var(--border-color); font-weight: 500; }
        .wa-messages { flex: 1; overflow-y: auto; padding: var(--padding-md); display: flex; flex-direction: column; gap: var(--margin-xs); }
        .wa-msg { max-width: 70%; padding: var(--padding-xs) var(--padding-sm); border-radius: var(--border-radius-md); background: var(--control-bg); word-break: break-word; }
        .wa-msg.out { align-self: flex-end; background: var(--bg-green); }
        .wa-msg-meta { font-size: var(--text-xs); color: var(--text-muted); }
        .wa-compose { display: flex; gap: var(--margin-sm); padding: var(--padding-sm); border-top: 1px solid var(--border-color); }
        @media (max-width: 768px) { .wa-side { width: 120px; } }
      </style>
    `);
    this.$chats = $(this.page.main).find(".wa-chats");
    this.$messages = $(this.page.main).find(".wa-messages");
    this.$head = $(this.page.main).find(".wa-head");
    this.$input = $(this.page.main).find(".wa-input");
    this.$send = $(this.page.main).find(".wa-send");

    this.session_field = frappe.ui.form.make_control({
      parent: $(this.page.main).find(".wa-session-field"),
      df: {
        fieldtype: "Select",
        fieldname: "session",
        placeholder: __("Session"),
        change: () => this.set_session(this.session_field.get_value()),
      },
      render_input: true,
    });

    let timer;
    $(this.page.main).find(".wa-search").on("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => this.load_chats(e.target.value), 300);
    });
    this.$send.on("click", () => this.send());
    this.$input.on("keydown", (e) => {
      if (e.key === "Enter") this.send();
    });
  }

  bind_realtime() {
    frappe.realtime.on("whatsapp_message", (data) => {
      if (data.session !== this.session) return;
      this.load_chats();
      if (this.chat && data.chat_id === this.chat.chat_id) this.load_messages();
    });
  }

  load_sessions() {
    frappe.call(`${API}.chat.get_sessions`).then((r) => {
      const sessions = r.message || [];
      this.session_field.df.options = sessions.map((s) => ({ label: s.session_id || s.name, value: s.name }));
      this.session_field.refresh();
      if (sessions.length) {
        this.session_field.set_value(sessions[0].name);
      } else {
        this.$chats.html(`<div class="text-muted p-3">${__("No WhatsApp session assigned to you")}</div>`);
      }
    });
  }

  set_session(session) {
    this.session = session;
    this.chat = null;
    this.$messages.empty();
    this.$head.text(__("Select a chat"));
    this.toggle_compose(false);
    this.load_chats();
  }

  load_chats(search) {
    if (!this.session) return;
    frappe
      .call(`${API}.groups_and_contacts.get_list`, {
        session: this.session,
        search: search || null,
        limit: 50,
      })
      .then((r) => {
        this.$chats.empty();
        (r.message || []).forEach((c) => {
          const $el = $(`
            <div class="wa-chat ${this.chat && this.chat.chat_id === c.chat_id ? "active" : ""}">
              <div class="wa-chat-name"><span>${frappe.utils.escape_html(c.chat_name || c.chat_id)}</span>
                ${c.unread_count ? `<span class="badge badge-primary">${c.unread_count}</span>` : ""}</div>
              <div class="wa-chat-last">${frappe.utils.escape_html(c.last_message_body || c.last_message_type || "")}</div>
            </div>`);
          $el.on("click", () => this.open_chat(c));
          this.$chats.append($el);
        });
      });
  }

  open_chat(chat) {
    this.chat = chat;
    this.$head.text(chat.chat_name || chat.chat_id);
    this.toggle_compose(true);
    this.load_messages().then(() =>
      frappe.call(`${API}.chat.mark_chat_read`, { chat_id: chat.chat_id, session: this.session })
        .then(() => this.load_chats())
    );
  }

  load_messages() {
    return frappe
      .call(`${API}.chat.get_messages`, { chat_id: this.chat.chat_id, session: this.session })
      .then((r) => {
        this.$messages.empty();
        (r.message || []).forEach((m) => this.$messages.append(this.message_html(m)));
        this.$messages.scrollTop(this.$messages[0].scrollHeight);
      });
  }

  message_html(m) {
    const out = m.type === "Outgoing";
    let body = frappe.utils.escape_html(m.body || m.caption || "");
    if (m.media_url) {
      const label = frappe.utils.escape_html(m.file_name || m.message_type);
      body = `<a href="${encodeURI(m.media_url)}" target="_blank">${label}</a>` + (body ? `<br>${body}` : "");
    }
    return `<div class="wa-msg ${out ? "out" : ""}">${body}
      <div class="wa-msg-meta">${frappe.datetime.str_to_user(m.creation)}${out ? " · " + __(m.status) : ""}</div></div>`;
  }

  toggle_compose(enabled) {
    this.$input.prop("disabled", !enabled);
    this.$send.prop("disabled", !enabled);
  }

  send() {
    const body = this.$input.val().trim();
    if (!body || !this.chat) return;
    this.$send.prop("disabled", true);
    frappe
      .call(`${API}.chat.send_message`, { chat_id: this.chat.chat_id, session: this.session, body })
      .then(() => {
        this.$input.val("");
        return this.load_messages();
      })
      .always(() => this.$send.prop("disabled", false));
  }
}
