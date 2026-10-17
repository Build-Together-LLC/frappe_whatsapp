import { useQuery } from '@tanstack/react-query';

const useGetUserList = (query: string) => {
  return useQuery({
    queryKey: ['listOfUsers', query],
    queryFn: () =>
      fetch(
        `/api/method/frappe.desk.search.search_link?doctype=User&txt=${query}&filters=%7B%22user_type%22%3A%22System%20User%22%2C%22enabled%22%3A1%7D&_=1691655357157`
      ).then((res) => res.json()),
  });
};

export default useGetUserList;
