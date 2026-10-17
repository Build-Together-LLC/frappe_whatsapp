import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';

const useAssignUserToContact = () => {
  const { selectedUser } = useAppContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: string) => {
      const myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
      myHeaders.append('Accept-Language', 'en-US,en;q=0.9');
      myHeaders.append(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8'
      );
      myHeaders.append('X-Frappe-Csrf-Token', window?.frappe?.csrf_token);

      const response = await fetch(
        `/api/method/frappe_whatsapp.personal_whatsapp.api.groups_and_contacts.assign_user_to_contact?user=${user}&chat_id=${selectedUser.id}`,
        {
          method: 'POST',
          headers: myHeaders,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to archive contact');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['Detail', selectedUser?.id ?? ''],
      });
    },
  });
};

export default useAssignUserToContact;
