import { useMutation } from '@tanstack/react-query';

const useArchiveContact = () => {
  return useMutation(
    async ({ chat_id, session }: { chat_id: string; session: string }) => {
      const myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
      myHeaders.append('Accept-Language', 'en-US,en;q=0.9');
      myHeaders.append(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8'
      );
      myHeaders.append('X-Frappe-Csrf-Token', window?.frappe?.csrf_token);

      const response = await fetch(
        `/api/method/frappe_whatsapp.personal_whatsapp.api.groups_and_contacts.archive_user?session=${session}&chat_id=${chat_id}`,
        {
          method: 'POST',
          headers: myHeaders,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to archive contact');
      }

      return response.json();
    }
  );
};

export default useArchiveContact;
