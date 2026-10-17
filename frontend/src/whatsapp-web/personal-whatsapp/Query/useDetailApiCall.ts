import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

export const useDetailApiCall = (name: string) => {
  const [searchParams] = useSearchParams();
  return useQuery({
    queryKey: ['Detail', name],
    queryFn: () => {
      if (name !== '') {
        return window.fetch(
            `/api/method/frappe_whatsapp.personal_whatsapp.api.groups_and_contacts.get_detail?chat_id=${name}&session=${searchParams.get('session')}`
          )
          .then((res) => res.json());
      } else {
        return Promise.resolve({ data: [] });
      }
    },
    enabled: name !== '',
    //   set stale time to 1 minute
    staleTime: 60 * 1000,
  });
};
