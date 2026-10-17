import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useMemo } from 'react';
import useCreateNewContact from '@/whatsapp-web/personal-whatsapp/Query/useCreateNewContact';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { MdOutlineArrowForward } from 'react-icons/md';

const NewUser = (userData: any) => {
  const { selectedUser, setSelectedUser } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate } = useCreateNewContact();
  const userName = userData.user?.name || '';
  const handleClick = (user: any) => {
    mutate(
      {
        sessionId: searchParams.get('session') || '',
        userId: user.id,
      },
      {
        onSuccess: () => {
          const user_id = user.id;
          setSelectedUser({
            chatType: 'Personal',
            id: user_id,
            isSelected: true,
            profilePicture: user.profile_picture,
            name: userName,
            markAsRead: user.mark_as_read,
          });
          navigate(
            `${location.pathname}?contact=${user_id}&session=${searchParams.get('session') || ''}&tab=${searchParams.get('tab') || ''}`
          );
        },
      }
    );
  };
  const userInitial = useMemo(() => {
    return userName
      .split(' ')
      .slice(0, 2)
      .map((text: string) => text.substring(0, 1).toUpperCase())
      .join('');
  }, [userName]);
  return (
    <div
      className={`${
        userData.user.id === selectedUser.id ? 'tw-bg-gray-100' : 'tw-bg-white'
      } tw-flex tw-h-[72px] tw-w-full tw-active:bg-gray-200 tw-group hover:tw-bg-gray-50 tw-mb-0.5`}
      onClick={() => handleClick(userData.user)}
    >
      <div
        className="tw-p-2 tw-pl-0 tw-flex tw-items-center tw-justify-center tw-ml-[16px]"
        role="button"
        tabIndex={0}
      >
        <p
          className="tw-h-[49px] tw-w-[49px] tw-m-0 tw-rounded-full
      tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-text-lg tw-text-gray-500"
        >
          {userInitial}
        </p>
      </div>
      <div className="tw-flex tw-flex-auto tw-flex-col tw-flex-grow tw-justify-center tw-min-w-0 tw-pr-[var(--chat-spacing)]">
        <div className="tw-flex tw-items-center tw-leading-normal tw-text-left tw-w-full">
          <span
            className=" tw-flex tw-grow tw-font-normal tw-overflow-hidden tw-whitespace-nowrap"
            title={userName}
          >
            <span className="tw-overflow-hidden tw-truncate tw-whitespace-nowrap tw-text-[17px] tw-text-[#111b21] tw-font-medium">
              Start New Conversation
            </span>
          </span>
        </div>
        <div className="tw-flex tw-items-center tw-justify-between tw-leading-normal tw-text-left">
          <span
            className=" tw-flex tw-grow tw-overflow-hidden tw-whitespace-nowrap tw-pr-6"
            title={userName}
          >
            <span className="tw-overflow-hidden tw-truncate tw-whitespace-nowrap tw-text-[14px] tw-text-gray-500">
              {userName}
            </span>
          </span>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-ml-auto tw-m-[16px]">
        <MdOutlineArrowForward size={35} className="tw-text-gray-500" />
      </div>
    </div>
  );
};
export default NewUser;
