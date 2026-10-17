import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';

const useGetSelectedSessionInfiniteQuery = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  return useInfiniteQuery({
    queryKey: ['sessionDetail', sessionId],
    queryFn: async () => {
      const url = `/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session.get_selected_session?session=${sessionId}`;
      const [response] = await Promise.all([fetch(url)]);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const Data = {
        sessionData: data,
      };
      return Data;
    },
    refetchInterval: 10000,
  });
};
export default useGetSelectedSessionInfiniteQuery;
