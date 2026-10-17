import { useMemo } from 'react';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useDetailApiCall } from '../../../Query/useDetailApiCall';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { AiOutlineUserAdd } from 'react-icons/ai';
import MarkAsRead from '@/whatsapp-web/personal-whatsapp/Right/ChatHeader/MarkAsRead';

const ChatHeaderProfile = () => {
  const { selectedUser, setAssignUserToContactView } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  let user = '';
  const handleAssignUser = () => {
    setAssignUserToContactView(true);
  };
  const { data } = useDetailApiCall(selectedUser.id);
  if (data) {
    if (selectedUser.chatType == 'Personal') {
      user = data.message.chat_name
        ? data.message.chat_name
        : data.message.chat_id;
    }
    if (selectedUser.chatType == 'Group') {
      if (data) {
        user = data.message.chat_name
          ? data.message.chat_name
          : data.message.chat_id;
      }
      if (!data && selectedUser.name) {
        user = selectedUser.name;
      }
    }
  }

  const handleProfileClick = () => {
    navigate(
      `?${new URLSearchParams({
        ...Object.fromEntries(searchParams),
        sidebar: 'true',
      })}`
    );
  };
  const userInitial = useMemo(() => {
    return user
      .split(' ')
      .slice(0, 2)
      .map((text: string) => text.substring(0, 1).toUpperCase())
      .join('');
  }, [user]);
  return (
    <button
      className={`tw-flex-grow tw-flex-row tw-flex tw-justify-center tw-items-center tw-bg-white focus:tw-outline-none tw-cursor-default`}
    >
      <div
        className={`tw-w-[20%] tw-h-[40px] md:tw-w-[15%] lg:tw-w-[7%] tw-flex tw-justify-center tw-items-center tw-cursor-pointer `}
        onClick={handleProfileClick}
      >
        {selectedUser.profilePicture ? (
          <img
            src={selectedUser.profilePicture}
            alt=""
            className="tw-w-[40px] tw-h-[40px] tw-rounded-full tw-m-2.5 tw-cursor-pointer"
          />
        ) : (
          <p className="tw-w-[40px] tw-cursor-default tw-h-[40px] tw-rounded-full tw-my-2  tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-text-lg tw-text-gray-400">
            {userInitial}
          </p>
        )}
      </div>
      <div className={`tw-flex tw-flex-grow tw-flex-col`}>
        <div className="tw-flex tw-flex-grow ">{user ?? ''}</div>
        <div
          className={`${selectedUser.chatType == 'Personal' ? 'tw-flex' : 'tw-hidden'} tw-flex-grow  tw-text-[13px] tw-text-gray-800 tw-font-thin tw-pl-1 tw-cursor-default`}
        >
          {selectedUser.id ? `+${selectedUser.id.replace('@c.us', '')}` : ''}
        </div>
      </div>
      <div className="tw-m-4">
        <MarkAsRead />
      </div>
      <span
        onClick={handleAssignUser}
        className="tw-mr-2 tw-bg-gray-100 tw-rounded-full tw-p-2 tw-flex tw-justify-center tw-items-center"
      >
        <AiOutlineUserAdd size={23} />
      </span>
    </button>
  );
};
export default ChatHeaderProfile;
