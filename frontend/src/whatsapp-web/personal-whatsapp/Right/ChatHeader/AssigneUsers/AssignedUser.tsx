import useUnAssignUser from '@/whatsapp-web/personal-whatsapp/Query/useUnAssignUser';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useDetailApiCall } from '@/whatsapp-web/personal-whatsapp/Query/useDetailApiCall';
import Loader from '@/shared/Loader';
import { useEffect, useState } from 'react';

export interface UserColorMap {
  [userId: string]: number;
}

export const colors = [
  { text: 'tw-text-green-800', color: 'tw-bg-green-200' },
  { text: 'tw-text-purple-800', color: 'tw-bg-purple-200' },
  { text: 'tw-text-indigo-800', color: 'tw-bg-indigo-200' },
  { text: 'tw-text-teal-800', color: 'tw-bg-teal-200' },
  { text: 'tw-text-orange-800', color: 'tw-bg-orange-200' },
  { text: 'tw-text-pink-800', color: 'tw-bg-pink-200' },
  { text: 'tw-text-cyan-800', color: 'tw-bg-cyan-200' },
  { text: 'tw-text-lime-800', color: 'tw-bg-lime-200' },
  { text: 'tw-text-rose-800', color: 'tw-bg-rose-200' },
  { text: 'tw-text-sky-800', color: 'tw-bg-sky-200' },
];

const AssignedUser = () => {
  const { selectedUser, setSelectedUserDetail } = useAppContext();
  const { mutateAsync } = useUnAssignUser();
  const { isLoading, data } = useDetailApiCall(selectedUser.id);
  const [usersWithColors, setUsersWithColors] = useState<UserColorMap>({});

  const chatAssignField = 'chat_assign_to';
  useEffect(() => {
    if (!isLoading) {
      setSelectedUserDetail(data?.message[chatAssignField]);
    }
  }, [data]);
  return (
    <>
      {isLoading ? (
        <>
          <Loader />
        </>
      ) : (
        <div
          className={'tw-flex tw-w-full tw-flex-col tw-max-h-[360px]  tw-mt-2'}
        >
          {data?.message[chatAssignField] ? (
            data?.message[chatAssignField].map((assign: any, index: number) => {
              if (!usersWithColors[assign.user_assign]) {
                usersWithColors[assign.user_assign] = Math.floor(
                  Math.random() * colors.length
                );
                setUsersWithColors({ ...usersWithColors });
              }
              return (
                <div className={`tw-group`} key={index}>
                  <div
                    className={
                      'tw-flex tw-justify-between tw-items-center tw-w-full tw-mt-1 tw-bg-gray-50 tw-px-3 tw-py-2 tw-rounded-md md:group-hover:tw-bg-gray-200 tw-shadow-sm'
                    }
                  >
                    <div
                      className={`${colors[usersWithColors[assign.user_assign]]?.text} tw-h-[40px] tw-w-[40px] tw-rounded-full tw-flex tw-shadow-md tw-items-center tw-justify-center ${colors[usersWithColors[assign.user_assign]]?.color} tw-opacity-[.80]`}
                    >
                      {assign.full_name
                        .split(' ')
                        .slice(0, 2)
                        .map((word: string): string => word[0])}
                    </div>
                    <div className={'tw-flex tw-flex-col tw-pl-3 tw-flex-grow'}>
                      <span
                        className={
                          'tw-font-semibold tw-text-gray-800 tw-text-sm'
                        }
                      >
                        {assign.full_name}
                      </span>
                      <span className={'tw-text-xs tw-text-gray-500'}>
                        {assign.user_assign}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        mutateAsync({
                          user: assign.user_assign,
                          chat_id: selectedUser.id,
                        });
                      }}
                      className={
                        'tw-w-[30px] tw-cursor-pointer tw-flex tw-items-center tw-justify-center tw-bg-transparent'
                      }
                    >
                      <span
                        className={
                          'tw-text-md tw-text-gray-600 md:group-hover:tw-text-red-600'
                        }
                      >
                        &times;
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <span className={'tw-text-gray-500 tw-text-sm'}>
              This Contact Is not Assigned To Any user.
            </span>
          )}
        </div>
      )}
    </>
  );
};
export default AssignedUser;
