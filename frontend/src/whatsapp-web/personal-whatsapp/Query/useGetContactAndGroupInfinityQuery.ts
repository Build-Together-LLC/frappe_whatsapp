import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';

const useGetContactAndGroupQuery = () => {
  const [searchParams] = useSearchParams();
  const { chatSearch, selectedFilterCategory, archivedView, createNewGroup } =
    useAppContext();
  const sessionId = searchParams.get('session');

  return useInfiniteQuery({
    queryKey: [
      'contactAndGroupList',
      sessionId,
      chatSearch,
      selectedFilterCategory,
      archivedView,
      createNewGroup,
    ],

    queryFn: async ({ pageParam = { limit: 10, offset: 0 } }) => {
      const { limit, offset } = pageParam;
      const url = `/api/method/frappe_whatsapp.personal_whatsapp.api.groups_and_contacts.get_list?session=${sessionId}&search=${chatSearch}&order_by=${selectedFilterCategory}&limit=${limit}&offset=${offset}&is_archived=${archivedView}&create_new_groups=${createNewGroup}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      return {
        contactData: data.message,
        nextParams: {
          limit,
          offset: offset + limit,
        },
        hasMore: data.message.length >= limit,
      };
    },

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextParams : undefined;
    },
    refetchInterval: 5000,
  });
};

export default useGetContactAndGroupQuery;
