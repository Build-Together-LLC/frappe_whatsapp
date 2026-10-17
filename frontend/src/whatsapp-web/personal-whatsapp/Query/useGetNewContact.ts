import { useMutation } from '@tanstack/react-query';

const useGetNewContact = () =>
  useMutation({
    mutationFn: async ({
      userId,
      sessionId,
    }: {
      userId: string;
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
      body.append('user_id', userId);
      body.append('session', sessionId);

      return fetch(
        '/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat.whatsapp_chat.get_whatsapp_contact',
        {
          method: 'POST',
          headers: myHeaders,
          body: body.toString(),
        }
      ).then((res) => res.json());
    },
  });

export default useGetNewContact;
