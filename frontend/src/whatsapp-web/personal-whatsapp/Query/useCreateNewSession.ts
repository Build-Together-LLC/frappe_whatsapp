import { useMutation, useQueryClient } from '@tanstack/react-query';

const useCreateNewSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionName }: { sessionName: string }) => {
      const myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
      myHeaders.append('Accept-Language', 'en-US,en;q=0.9');
      myHeaders.append(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8'
      );
      myHeaders.append('X-Frappe-Csrf-Token', window?.frappe?.csrf_token);

      const response = await fetch(
        `/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session.create_session?session_name=${sessionName}`,
        {
          method: 'POST',
          headers: myHeaders,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to un assign user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['activeSessionList'],
      });
    },
  });
};
export default useCreateNewSession;
