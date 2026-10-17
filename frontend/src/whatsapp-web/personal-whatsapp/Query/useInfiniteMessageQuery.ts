import { useInfiniteQuery } from '@tanstack/react-query';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useSearchParams } from 'react-router-dom';

const useInfiniteMessageQuery = (isIntersecting: boolean) => {
  const { selectedUser } = useAppContext();
  const [searchParams] = useSearchParams();

  const fetchMessages = async ({
    start,
    end,
  }: {
    start: number;
    end: number;
  }) => {
    console.log(start, end);
    const response = await fetch(
      `/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_chat_message.whatsapp_chat_message.get_whatsapp_msg?chat_id=${selectedUser.id}&session=${searchParams.get('session')}`
    );
    return response.json();
  };

  return useInfiniteQuery({
    queryKey: ['messageList', selectedUser.id ?? ''],
    queryFn: async ({ pageParam = { start: 0, end: 25 } }) => {
      if (selectedUser.id ?? '') {
        return fetchMessages(pageParam).then((data) => {
          if (data.length === 0) {
            return null;
          }
          return data;
        });
      } else {
        return Promise.resolve({ data: [] });
      }
    },
    refetchInterval: 4000,
    getNextPageParam: (lastPage, allPages) => {
      const totalMessages = allPages.reduce((acc, page) => {
        return acc + (page?.data?.length ?? 25);
      }, 0);

      const lastPageLength = lastPage?.data?.length ?? 0;

      const limitStart: number = totalMessages + 1;
      return lastPageLength === 25 ? { start: limitStart, end: 25 } : undefined;
    },
    enabled: isIntersecting,
  });
};
export default useInfiniteMessageQuery;
