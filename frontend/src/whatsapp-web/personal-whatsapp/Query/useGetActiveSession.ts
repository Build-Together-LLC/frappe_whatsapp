import { useQuery } from '@tanstack/react-query';

const useGetActiveSession = () => {
  return useQuery({
    queryKey: ['activeSessionList'],
    queryFn: () =>
      fetch(
        '/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session.get_assigned_session'
      ).then((res) => res.json()),
  });
};
export default useGetActiveSession;
