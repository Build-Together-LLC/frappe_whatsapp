import UserList from '@/whatsapp-web/personal-whatsapp/Left/UserList';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useScreenSize } from '@/whatsapp-web/Hooks/useScreenSize';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoArrowBackOutline } from 'react-icons/io5';
import useCreateGroup from '@/whatsapp-web/personal-whatsapp/Query/useCreateGroup';
import StatusBanner from '@/whatsapp-web/personal-whatsapp/Left/StatusBanner/StatusBanner';
import QrCodeView from '@/whatsapp-web/personal-whatsapp/Left/StatusBanner/QrCodeView';

function Index() {
  const [searchParams] = useSearchParams();
  const {
    setSelectedUser,
    selectedUser,
    chosenGroupUserIds,
    setChosenGroupUserIds,
    setCreateNewGroup,
    userData,
  } = useAppContext();
  const [isVisible, setIsVisible] = useState(true);
  const [createGroup, setCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const { isMobileView } = useScreenSize();
  const navigate = useNavigate();
  const { mutate } = useCreateGroup();

  useEffect(() => {
    if (isMobileView) {
      if (selectedUser.isSelected) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } else setIsVisible(true);
  }, [isMobileView, selectedUser.isSelected]);
  const contact = searchParams.get('contact');
  const group = searchParams.get('group');
  useEffect(() => {
    let profileImage = '';
    let markAsRead = true;
    let name = '';
    if (userData && selectedUser.id && !selectedUser.profilePicture) {
      const profileData = userData.filter(
        (user: any) => user.name === selectedUser.id
      );
      if (profileData.length > 0 && profileData[0].profile_picture) {
        profileImage = profileData[0].profile_picture;
        markAsRead = profileData[0].mark_as_read;
        name =
          profileData[0].type === 'contact'
            ? profileData[0].user_name
            : profileData[0].group_name;
      }
      setSelectedUser({
        chatType: selectedUser.chatType,
        id: selectedUser.id,
        isSelected: selectedUser.isSelected,
        profilePicture: profileImage,
        name: name,
        markAsRead: markAsRead,
      });
    }
  }, [userData]);
  useEffect(() => {
    contact
      ? setSelectedUser({
          chatType: 'Personal',
          id: contact,
          isSelected: true,
        })
      : null;
    group
      ? setSelectedUser({
          chatType: 'Group',
          id: group,
          isSelected: true,
        })
      : null;
  }, []);

  const userInitial = useMemo(() => {
    return groupName
      .split(' ')
      .slice(0, 2)
      .map((text: string) => text.substring(0, 1).toUpperCase())
      .join('');
  }, [groupName]);

  const handleOpenCreateGroupForm = () => {
    setCreateGroup(true);
  };

  const handleCreateGroup = () => {
    if (groupName.length && groupName.trim().length !== 0) {
      mutate(
        {
          groupName,
          groupMembers: chosenGroupUserIds,
          sessionId: searchParams.get('session') || '',
        },
        {
          onSuccess: (group_id) => {
            setTimeout(() => {
              const groupId = group_id.message?.result;
              setSelectedUser({
                id: groupId,
                chatType: 'Group',
                isSelected: true,
                name: groupName,
              });

              navigate(
                `${location.pathname}?group=${groupId}&session=${searchParams.get('session') || ''}&tab=${searchParams.get('tab') || ''}`
              );
            }, 1000);
          },
        }
      );
      setCreateGroup(false);
      setCreateNewGroup(false);
      setChosenGroupUserIds([]);
      setGroupName('');
    } else {
      return;
    }
  };
  return (
    <>
      {isVisible && (
        <div className="md:tw-flex lg:tw-flex tw-flex-col tw-w-screen md:tw-max-w-[480px] lg:tw-w-[40%] md:tw-w-[40%] tw-grow-0 tw-shrink-0 md:tw-basis-[40%] tw-bg-[#fffff] tw-min-w-[330px] tw-flex tw-overflow-x-hidden">
          <StatusBanner />
          {!createGroup ? (
            <>
              <UserList />
              {chosenGroupUserIds.length ? (
                <div className="tw-flex tw-justify-center tw-items-center tw-z-20 tw-my-4">
                  <button
                    className="tw-bg-green-500 tw-text-white tw-px-3 tw-rounded-full tw-py-1"
                    onClick={handleOpenCreateGroupForm}
                  >
                    <FaArrowRightLong size={30} />
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            //create Group Form
            <>
              <div className="tw-w-full ">
                {/*back button*/}
                <div className="tw-w-full tw-pl-3">
                  <span onClick={() => setCreateGroup(false)}>
                    <IoArrowBackOutline size={30} />
                  </span>
                </div>
                {/*main form*/}
                <div className="tw-flex tw-flex-col">
                  <div className="tw-flex tw-justify-center tw-mt-14 tw-flex-row">
                    <p
                      className="tw-h-[100px] tw-w-[100px] tw-m-0 tw-rounded-full
          tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-text-gray-500 tw-text-[60px]"
                    >
                      {userInitial}
                    </p>
                  </div>
                  <div className="tw-flex tw-justify-center tw-items-center tw-mt-10">
                    <input
                      type="text"
                      placeholder="Group Name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="tw-border-0 tw-border-b-2 tw-border-gray-400 tw-focus:border-blue-500 tw-focus:outline-none tw-w-[80%] tw-text-[25px]"
                    />
                  </div>
                  <div className="tw-flex tw-justify-center tw-items-center tw-mt-10">
                    <button
                      className="tw-px-5 tw-py-2.5 tw-rounded tw-bg-green-500 tw-text-white"
                      onClick={handleCreateGroup}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <QrCodeView />
    </>
  );
}

export default Index;
