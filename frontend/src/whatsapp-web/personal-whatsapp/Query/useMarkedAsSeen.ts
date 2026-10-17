import { useMutation } from '@tanstack/react-query';

const useMarkAsSeen = () =>
  useMutation({
    mutationFn: async ({
      msgName,
      sessionId,
    }: {
      msgName: string;
      sessionId: string;
    }) => {
      const myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
      myHeaders.append('Accept-Language', 'en-US,en;q=0.9');
      myHeaders.append(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8'
      );
      myHeaders.append('X-Frappe-Csrf-Token', window?.frappe?.csrf_token);

      const body = `name=${encodeURIComponent(msgName)}&session_id=${encodeURIComponent(sessionId)}`;

      return fetch(
        '/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message.whatsapp_chat_message.mark_as_seen',
        {
          method: 'POST',
          headers: myHeaders,
          body: body,
        }
      ).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to mark message as seen.');
        }
        return res.json();
      });
    },
  });

export default useMarkAsSeen;
