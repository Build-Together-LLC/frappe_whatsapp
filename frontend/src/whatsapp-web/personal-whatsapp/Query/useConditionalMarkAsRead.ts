import { useMutation } from '@tanstack/react-query';

const useConditionalMarkAsRead = () =>
  useMutation({
    mutationFn: async ({
      chatId,
      markAsRead,
    }: {
      chatId: string;
      markAsRead: boolean;
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
      body.append('chat_id', chatId);
      body.append('mark_as_read', markAsRead.toString());

      return fetch(
        '/api/method/frappe_whatsapp.personal_whatsapp.api.groups_and_contacts.Mark_as_read_conditional',
        {
          method: 'POST',
          headers: myHeaders,
          body: body.toString(),
        }
      ).then((res) => res.json());
    },
  });

export default useConditionalMarkAsRead;
