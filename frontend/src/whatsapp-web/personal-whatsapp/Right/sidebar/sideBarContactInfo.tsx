import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { PiUserCircle } from 'react-icons/pi';
import { MdExitToApp } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import useLeaveGroup from '@/whatsapp-web/personal-whatsapp/Query/useLeaveGroup';

const SideBarContactInfo = () => {
  const { selectedUser } = useAppContext();
  const [searchParams] = useSearchParams();
  const { mutate } = useLeaveGroup();
  const handleExitGroup = () => {
    mutate({
      sessionId: searchParams.get('session') || '',
      groupId: searchParams.get('group') || '',
    });
  };
  return (
    <>
      <div className="tw-w-full tw-flex tw-justify-center tw-items-center tw-flex-col  tw-m-1">
        <span className="tw-rounded-full tw-shrink-0 tw-p-2">
          {selectedUser.profilePicture ? (
            <img
              src={selectedUser.profilePicture}
              className="tw-rounded-full tw-shrink-0 tw-w-16 tw-h-16 sm:tw-w-20 sm:tw-h-20 md:tw-w-24 md:tw-h-24 lg:tw-w-28 lg:tw-h-28 xl:tw-w-32 xl:tw-h-32"
            />
          ) : (
            <PiUserCircle
              className={
                'tw-w-16 tw-h-16 sm:tw-w-20 sm:tw-h-20 md:tw-w-24 md:tw-h-24 lg:tw-w-28 lg:tw-h-28 xl:tw-w-32 xl:tw-h-32'
              }
            />
          )}
        </span>
        <div className="tw-pt-1 tw-text-sm">{selectedUser.name}</div>
        <div
          className={`tw-pt-1 tw-text-sm ${selectedUser.chatType === 'Personal' ? '' : 'tw-hidden'}`}
        >
          +{selectedUser.id.replace('@c.us', '')}
        </div>
      </div>
      {selectedUser.chatType === 'Group' ? (
        <div
          className={
            'tw-w-full tw-flex tw-justify-center tw-flex-col  tw-m-1 tw-pl-4 tw-text-red-500'
          }
        >
          <div onClick={handleExitGroup} className={'tw-cursor-pointer'}>
            <MdExitToApp />
            <span className={'tw-ml-2 tw-pt-3'}>Exit group</span>
          </div>
        </div>
      ) : null}
    </>
  );
};
export default SideBarContactInfo;
