import { useEffect, useMemo, useState } from 'react';
import UserListSkeleton from '@/whatsapp-web/Components/Shared/UserListSkeleton';
import User from './User';
import { useInView } from 'react-intersection-observer';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import useGetNewContact from '@/whatsapp-web/personal-whatsapp/Query/useGetNewContact';
import { useSearchParams } from 'react-router-dom';
import NewUser from '@/whatsapp-web/personal-whatsapp/Left/UserList/User/NewUser';
import { IoArrowBackSharp } from 'react-icons/io5';
import { MdOutlineArchive } from 'react-icons/md';
import useGetSelectedSessionInfiniteQuery from '@/whatsapp-web/personal-whatsapp/Query/useGetSelectedSessionInfiniteQuery';
import useGetContactAndGroupQuery from '../../Query/useGetContactAndGroupInfinityQuery';

interface DataArrayType {
  last_message: string;
  last_message_time: string;
  type: string;
  unread_count: number;
  chat_id: string;
  chat_name: string;
  is_archived: boolean;
}

const UserListComponent = () => {
  const [newUserData, setNewUserData] = useState<any[]>([]);
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useGetContactAndGroupQuery();
  const { data: sessionData } = useGetSelectedSessionInfiniteQuery();
  const [searchParams] = useSearchParams();
  const {
    chatSearch,
    selectedFilterCategory,
    createNewGroup,
    setCreateNewGroup,
    setSelectedFilterCategory,
    selectedUser,
    setChosenGroupUserIds,
    chosenGroupUserIds,
    archivedView,
    setArchivedView,
    userData,
    setUserData,
    setSelectedSessionDetail,
    setSelectedUser,
  } = useAppContext();
  const { mutate, isLoading } = useGetNewContact();

  const allContacts = useMemo(
    () => data?.pages?.flatMap((page: any) => page.contactData) || [],
    [data?.pages]
  );

  useEffect(() => {
    if (!data?.pages) return;
    setUserData(
      allContacts.filter(
        (item: any) => !item.is_archived && item.last_message_time
      )
    );
    if (archivedView) {
      setUserData(allContacts.filter((item: any) => item.is_archived));
    }
    if (createNewGroup) {
      setSelectedFilterCategory('All');
    }
  }, [allContacts, archivedView, createNewGroup]);

  const isMobileNo = (search: string): boolean => {
    return !isNaN(Number(search)) && search.length >= 10;
  };

  const handleBackFromArchived = () => {
    setArchivedView(false);
  };
  useEffect(() => {
    if (!data?.pages[0].contactData) return;
    let filteredData = allContacts;
    if (!chatSearch) {
      filteredData = allContacts.filter(
        (contact: any) => contact.last_message_time && !contact.is_archived
      );
    }

    if (createNewGroup) {
      filteredData = allContacts.filter(
        (item: { type: string }) => item.type === 'Contact'
      );
    }

    setUserData(filteredData);
    setSelectedSessionDetail(sessionData?.pages[0].sessionData.message);
  }, [data, chatSearch, selectedFilterCategory, createNewGroup, archivedView]);

  useEffect(() => {
    setSelectedUser({
      id: '',
      chatType: '',
      isSelected: false,
      profilePicture: '',
      name: '',
      markAsRead: false,
    });
  }, [searchParams.get('session') || '']);

  useEffect(() => {
    if (!userData.length && isMobileNo(chatSearch)) {
      mutate(
        {
          sessionId: searchParams.get('session') || '',
          userId: chatSearch,
        },
        {
          onSuccess: (value) => {
            if (value.message?.numberExists === false) return;
            setNewUserData([
              {
                name:
                  value.message?.name ||
                  value.message?.pushname ||
                  value.message?.number,
                id: value.message.id,
              },
            ]);
          },
        }
      );
    }
  }, [chatSearch]);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (!data?.pages[0].contactData.length && isLoading) {
    return <UserListSkeleton listItems={5} />;
  }

  const handleBackFromCreateGroup = () => {
    setUserData(
      allContacts.filter(
        (contact: any) => contact.last_message_time && !contact.is_archived
      )
    );
    setChosenGroupUserIds([]);
    setCreateNewGroup(false);
  };

  if (isFetching && !data?.pages?.length)
    return <UserListSkeleton listItems={5} />;

  const loadButton = (
    <button
      className="tw-opacity-0"
      ref={ref}
      disabled={!hasNextPage || isFetchingNextPage}
    >
      {isFetchingNextPage ? 'Loading......' : 'Load Newer'}
    </button>
  );

  return (
    <>
      {archivedView && (
        <div className="tw-w-full tw-bg-white tw-pt-2 tw-border-b tw-sticky tw-top-0 tw-z-20">
          <div className="tw-flex tw-items-center bg-gray-200 tw-ml-[16px] tw-p-2 tw-cursor-default">
            <IoArrowBackSharp
              className="tw-text-green-500 tw-text-2xl tw-cursor-pointer"
              onClick={handleBackFromArchived}
            />
            <span className="tw-ml-2 tw-text-lg tw-font-bold tw-text-gray-800">
              Archived
            </span>
          </div>
        </div>
      )}
      {createNewGroup ? (
        <div className="tw-w-full tw-bg-white tw-pt-2 tw-border-b tw-sticky tw-top-0 tw-z-20">
          <div className="tw-flex tw-items-center bg-gray-200 tw-ml-[16px] tw-p-2 tw-cursor-default">
            <IoArrowBackSharp
              className="tw-text-green-500 tw-text-2xl tw-cursor-pointer"
              onClick={handleBackFromCreateGroup}
            />
            <span className="tw-ml-2 tw-text-lg tw-font-bold tw-text-gray-800">
              Create New Group
            </span>
          </div>
        </div>
      ) : null}

      <div className={`tw-w-full}`}>
        <div
          className={`tw-mx-[16px] tw-p-2 ${
            createNewGroup || archivedView ? 'tw-hidden' : 'tw-flex'
          } tw-items-center tw-cursor-pointer`}
          onClick={() => setArchivedView(!archivedView)}
        >
          <MdOutlineArchive className="tw-text-[26px] tw-text-green-500" />
          <span className="tw-ml-2 tw-text-[18px]">Archived</span>
        </div>
        {userData &&
          userData.length > 0 &&
          userData
            .sort((a: any, b: any) => {
              if (createNewGroup) {
                const isAChosen = chosenGroupUserIds.includes(a.chat_id!);
                const isBChosen = chosenGroupUserIds.includes(b.chat_id!);
                if (isAChosen && !isBChosen) return -1;
                if (!isAChosen && isBChosen) return 1;
              }
              return 0;
            })
            .map((user: DataArrayType) => (
              <div
                key={user.chat_id}
                className={`${
                  user.chat_id === selectedUser.id
                    ? 'tw-bg-gray-100'
                    : 'tw-bg-white'
                } tw-w-full tw-flex tw-cursor-pointer tw-justify-center tw-align-item hover:tw-bg-gray-50`}
              >
                <User user={user} archived={user.is_archived} />
              </div>
            ))}
        {loadButton}
        <div className={'tw-w-full tw-h-1'}></div>
        {userData &&
          !userData.length &&
          newUserData &&
          newUserData.length > 0 &&
          newUserData.map((user: any, index: number) => (
            <div
              key={index}
              className={`${
                user.chat_id === selectedUser.id
                  ? 'tw-bg-gray-100'
                  : 'tw-bg-white'
              } tw-w-full tw-flex tw-cursor-pointer tw-justify-center tw-align-item hover:tw-bg-gray-50`}
            >
              <NewUser user={user} />
            </div>
          ))}
        {userData &&
          !isLoading &&
          !userData.length &&
          newUserData &&
          !newUserData.length &&
          isMobileNo(chatSearch) && (
            <div className="tw-text-center tw-mt-2 tw-p-4 tw-bg-red-100 tw-border tw-border-red-300 tw-rounded tw-text-red-800 tw-font-semibold">
              No user exists for the provided number
            </div>
          )}
        <p className="tw-text-center" style={{ display: 'none' }}>
          No Contact Exist
        </p>
      </div>
    </>
  );
};

export default UserListComponent;
