import { useMutation } from '@tanstack/react-query';

const useLeaveGroup = () =>
  useMutation({
    mutationFn: async ({
      groupId,
      sessionId,
    }: {
      groupId: string;
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

      const body = new URLSearchParams();
      body.append('group_id', groupId);
      body.append('session_id', sessionId);

      return fetch(
        '/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat.whatsapp_chat.leave_whatsapp_group',
        {
          method: 'POST',
          headers: myHeaders,
          body: body.toString(),
        }
      ).then((res) => res.json());
    },
  });

export default useLeaveGroup;
