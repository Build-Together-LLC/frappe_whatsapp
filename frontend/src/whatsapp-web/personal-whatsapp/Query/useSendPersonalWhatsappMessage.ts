import { useMutation } from '@tanstack/react-query';

export type Variables = {
  session: string | null;
  type: string | null;
  message_type: string | null;
  conversation_type: string | null;
  user_id: string | null;
  group_id: string | null;
  body: string | null;
  mime_type: string | null;
  media_url: string | null;
  file_name: string | null;
  caption: string | null;
  scheduled_at?: string | null;
  status?: string | null;
};

const createVariables = ({
  session,
  type = 'Outgoing',
  message_type,
  conversation_type = null,
  user_id = null,
  group_id = null,
  body = null,
  mime_type = null,
  media_url = null,
  file_name = null,
  caption = null,
  status = null,
  scheduled_at = null,
}: Variables) => {
  let data: Variables = {
    session: session,
    type: type,
    message_type: message_type,
    conversation_type: conversation_type,
    user_id: user_id,
    group_id: group_id,
    body: body,
    mime_type: mime_type,
    media_url: media_url,
    file_name: file_name,
    caption: caption,
  };

  if (scheduled_at && status) {
    data = { ...data, status: status, scheduled_at: scheduled_at };
    console.log(data);
  }
  return data;
};

const sendChatMessage = async (variables: Variables) => {
  const { session, message_type, group_id, user_id, ...rest } =
    createVariables(variables);
  const response = await window.fetch(
    '/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message.whatsapp_chat_message.send_chat_message',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frappe-Csrf-Token': window?.frappe?.csrf_token,
      },
      body: JSON.stringify({
        session,
        message_type,
        chat_id: group_id || user_id,
        body: rest.body,
        mime_type: rest.mime_type,
        media_url: rest.media_url,
        file_name: rest.file_name,
        caption: rest.caption,
        scheduled_at: variables.scheduled_at,
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?._server_messages || data?.exception || 'Send failed');
  }
  return data;
};

const useSendPersonalWhatsappMessage = (isSchedule = false) => {
  return useMutation({
    mutationFn: (variables: Variables) =>
      sendChatMessage(
        isSchedule ? variables : { ...variables, scheduled_at: null }
      ),
  });
};

export default useSendPersonalWhatsappMessage;
