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

const CreateFrappeMessage = async (variables: Variables) => {
  return window.fetch('/api/resource/WhatsApp Chat Message', {
      method: 'POST',
      body: JSON.stringify(variables),
      headers: {
        'X-Frappe-Csrf-Token': window?.frappe?.csrf_token,
      },
    })
    .then((res) => res.json());
};

const sendPersonalWhatsappMessage = (data: any) => {
  const myHeaders = new Headers();
  myHeaders.append('accept', 'application/json');
  myHeaders.append('accept-language', 'en-US,en;q=0.9');
  myHeaders.append(
    'content-type',
    'application/x-www-form-urlencoded; charset=UTF-8'
  );

  myHeaders.append('X-Frappe-Csrf-Token', window?.frappe?.csrf_token);

  const body = `docs=${encodeURIComponent(JSON.stringify(data))}&method=send`;
  return window.fetch('/api/method/run_doc_method', {
      method: 'POST',
      headers: myHeaders,
      body: body,
    })
    .then((res) => res.json());
};
const useSendPersonalWhatsappMessage = (isSchedule = false) => {
  return useMutation({
    mutationFn: (variables: Variables) =>
      CreateFrappeMessage(createVariables(variables)).then((data) => {
        if (!isSchedule) {
          sendPersonalWhatsappMessage(data?.data);
        }
        return data;
      }),
  });
};

export default useSendPersonalWhatsappMessage;
