import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useMemo, useRef } from 'react';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { IoIosCamera, IoMdHeadset } from 'react-icons/io';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { MdOutlineVideocam } from 'react-icons/md';
import { FaChevronDown } from 'react-icons/fa6';
import MoreOptionDropDown from '@/whatsapp-web/personal-whatsapp/Left/UserList/User/MoreOptionDropDown';
import useArchiveContact from '@/whatsapp-web/personal-whatsapp/Query/useArchiveContact';
import useUnArchiveContact from '@/whatsapp-web/personal-whatsapp/Query/useUnArchivedContact';

function Index({ user, archived }: { user: any; archived?: any }) {
  const {
    setSelectedUser,
    selectedUser,
    createNewGroup,
    setChosenGroupUserIds,
    chosenGroupUserIds,
    setMoreOptionOpen,
    moreOptionOpen,
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const checkboxRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { mutateAsync: archiveUser } = useArchiveContact();
  const { mutateAsync: unArchiveUser } = useUnArchiveContact();
  const userName = user.chat_name ? user.chat_name : user.chat_id;
  const userInitial = useMemo(() => {
    return userName
      .split(' ')
      .slice(0, 2)
      .map((text: string) => text.substring(0, 1).toUpperCase())
      .join('');
  }, [userName]);
  const id: string = user.chat_id;
  const contactType = user.type === 'Group' ? 'group' : 'contact';

  const handleClick = (userData: any) => {
    if (createNewGroup) {
      const userId: string = userData.chat_id;
      if (checkboxRef.current) {
        checkboxRef.current.checked = !checkboxRef.current.checked;
        if (checkboxRef.current.checked) {
          if (!chosenGroupUserIds.includes(userId)) {
            setChosenGroupUserIds([...chosenGroupUserIds, userId]);
          }
        }
        if (!checkboxRef.current.checked) {
          setChosenGroupUserIds(
            chosenGroupUserIds.filter(
              (SelectedUserId: any) => userId !== SelectedUserId
            )
          );
        }
      }
      return;
    } else {
      setSelectedUser({
        id: user.chat_id,
        chatType: user.type == 'Contact' ? 'Personal' : 'Group',
        isSelected: true,
        profilePicture: user.profile_picture,
        name: user.chat_name,
        markAsRead: user.mark_as_read,
      });
      navigate(
        `${location.pathname}?${contactType}=${id}&session=${searchParams.get('session') || ''}&tab=${searchParams.get('tab') || ''}`
      );
    }
  };
  const handleArchived = (archive: boolean, user_data: any) => {
    const chat_id = user_data.chat_id;
    const session = searchParams.get('session') || '';
    if (archive) {
      archiveUser({
        chat_id,
        session,
      });
    } else {
      unArchiveUser({
        chat_id,
        session,
      });
    }
  };

  const getRelativeTime = (date: any) => {
    const today: any = new Date();
    const givenDate: any = new Date(date);
    const timeDiff = Math.floor((today - givenDate) / (1000 * 60 * 60 * 24));

    if (timeDiff === 0) return 'today';
    if (timeDiff === 1) return 'yesterday';
    return givenDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });
  };
  const showMessageType = (type: string) => {
    if (type === 'Image') {
      return (
        <span className="tw-flex tw-justify-center tw-items-center tw-text-[16px]">
          <IoIosCamera className="tw-h-[20px] tw-w-[20px]" />
          <p className="tw-m-0 tw-p-0 tw-text-[16px]">photo</p>
        </span>
      );
    }
    if (type === 'Video') {
      return (
        <span className="tw-flex tw-justify-center tw-items-center tw-text-[16px]">
          <MdOutlineVideocam className="tw-h-[20px] tw-w-[20px]" />
          <p className="tw-m-0 tw-p-0 tw-text-[16px]">video</p>
        </span>
      );
    }
    if (type === 'Document') {
      return (
        <span className="tw-flex tw-justify-center tw-items-center tw-text-[16px]">
          <IoDocumentTextOutline className="tw-h-[20px] tw-w-[20px]" />

          <p className="tw-m-0 tw-p-0 tw-text-[16px]">document</p>
        </span>
      );
    }
    if (type === 'Audio') {
      return (
        <span className="tw-flex tw-justify-center tw-items-center tw-text-[16px]">
          <IoMdHeadset className="tw-h-[20px] tw-w-[20px]" />
          <p className="tw-m-0 tw-p-0 tw-text-[16px]">audio</p>
        </span>
      );
    }
  };
  const profileClick = () => {
    window.open(user.profile_picture);
  };
  return (
    <div
      className={`${
        id === selectedUser.id ? 'tw-bg-gray-100' : 'tw-bg-white'
      } tw-flex tw-h-[72px] tw-w-full tw-active:bg-gray-200 tw-group hover:tw-bg-gray-50 tw-mb-0.5 `}
      onClick={() => handleClick(user)}
    >
      <div
        className="tw-p-2 tw-pl-0 tw-flex tw-items-center tw-justify-center tw-ml-[16px]"
        role={'button'}
        tabIndex={0}
      >
        {user.profile_picture ? (
          <div className="tw-h-[49px] tw-w-[49px] tw-rounded-full tw-shrink-0 ">
            <img
              role={'button'}
              onClick={profileClick}
              src={`${user.profile_picture}`}
              alt="alt"
              className="tw-h-[49px] tw-w-[49px] tw-rounded-full tw-shrink-0 "
            />
          </div>
        ) : (
          <p
            className="tw-h-[49px] tw-w-[49px] tw-m-0 tw-rounded-full
          tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-text-lg tw-text-gray-500"
          >
            {userInitial}
          </p>
        )}
      </div>
      <div className="tw-flex tw-flex-auto tw-flex-col tw-flex-grow tw-justify-center tw-min-w-0 tw-pr-[var(--chat-spacing)]">
        <div className="tw-flex tw-items-center tw-leading-normal tw-text-left tw-w-full">
          <span
            className=" tw-flex tw-grow tw-font-normal tw-overflow-hidden tw-whitespace-nowrap"
            title={userName}
          >
            <span className="tw-overflow-hidden tw-truncate tw-whitespace-nowrap tw-text-[17px] tw-text-[#111b21] tw-font-medium">
              {userName}
            </span>
          </span>
          <span
            className={`tw-font-normal ${
              user.unread_count ? 'tw-text-green-500' : 'tw-text-[#667781]'
            } tw-mt-[3px] tw-overflow-hidden tw-line-clamp-1 tw-whitespace-nowrap tw-text-ellipsis tw-leading-[14px] tw-text-[12px] tw-px-[16px] tw-shrink-0 ${user.last_message_time ? 'tw-block' : 'tw-hidden'}`}
          >
            {getRelativeTime(
              window?.frappe?.datetime.convert_to_user_tz(
                user.last_message_time
              ) || user.last_message_time
            ) === 'today'
              ? new Date(
                  window?.frappe?.datetime.convert_to_user_tz(
                    user.last_message_time
                  ) || user.last_message_time
                ).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : getRelativeTime(
                  window?.frappe?.datetime.convert_to_user_tz(
                    user.last_message_time
                  ) || user.last_message_time
                )}
          </span>
        </div>
        <div className="tw-flex tw-items-center tw-justify-between tw-leading-normal tw-text-left">
          <span
            className=" tw-flex tw-grow tw-overflow-hidden tw-whitespace-nowrap tw-pr-6"
            title={userName}
          >
            <span className="tw-overflow-hidden tw-truncate tw-whitespace-nowrap tw-text-[14px] tw-text-gray-500">
              {user.last_message_body
                ? user.last_message_body
                : showMessageType(user.last_message_type)}
            </span>
          </span>
          <div className="tw-relative tw-text-[#8696a0] group-hover:tw-w-[57px] tw-flex tw-justify-end">
            {user.unread_count > 0 && (
              <span
                className="tw-bg-green-500 tw-text-white tw-text-xs tw-shrink-0 tw-font-semibold tw-rounded-full tw-flex tw-items-center tw-justify-center tw-w-5 tw-h-5 tw-self-start tw-mx-[16px]"
                title={`${user.unread_count} unread messages`}
              >
                {user.unread_count}
              </span>
            )}
            {archived ? (
              <span className="tw-text-[12px] tw-mr-[16px] tw-p-0.5 tw-border">
                Archived
              </span>
            ) : null}
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setMoreOptionOpen(user.chat_id);
              }}
              className={`tw-opacity-0 group-hover:tw-opacity-100 tw-hidden tw-transition-all group-hover:tw-flex  tw-justify-center tw-items-center tw-cursor-pointer tw-mr-[16px] `}
            >
              <FaChevronDown />
            </span>

            {moreOptionOpen === user.chat_id && (
              <div
                className={'tw-cursor-pointer'}
                style={{ zIndex: 10000 }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreOptionDropDown
                  options={[
                    {
                      label: user.is_archived
                        ? 'UnArchive Chat'
                        : 'Archive Chat',
                      onPress: () => handleArchived(!user.is_archived, user),
                    },
                  ]}
                  onClose={() => {
                    setMoreOptionOpen('');
                  }}
                />
              </div>
            )}
          </div>
          {createNewGroup ? (
            <span className="tw-flex tw-justify-center tw-items-center tw-mr-[16px]  tw-shrink-0">
              <input
                type="checkbox"
                ref={checkboxRef}
                className="tw-mr-1 tw-w-3 tw-h-3 tw-border tw-border-blue-500 tw-rounded-full tw-checked:bg-blue-500 tw-checked:border-transparent tw-focus:outline-none"
                checked={chosenGroupUserIds.some(
                  (userId: any) => user.chat_id === userId
                )}
              />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Index;
