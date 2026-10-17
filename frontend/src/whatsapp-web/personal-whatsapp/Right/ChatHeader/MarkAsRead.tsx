import { useEffect, useState } from 'react';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import useConditionalMarkAsRead from '@/whatsapp-web/personal-whatsapp/Query/useConditionalMarkAsRead';

const MarkAsRead = () => {
  const { selectedUser } = useAppContext();
  const [isMarkAsRead, setIsMarkAsRead] = useState(selectedUser.markAsRead);
  const { mutate } = useConditionalMarkAsRead();
  useEffect(() => {
    setIsMarkAsRead(selectedUser.markAsRead);
  }, [selectedUser]);
  const handleIsToggled = () => {
    setIsMarkAsRead(!isMarkAsRead);
    mutate({
      chatId: selectedUser.id,
      markAsRead: !isMarkAsRead,
    });
  };

  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <button
        onClick={() => handleIsToggled()}
        className={`tw-relative tw-w-16 tw-h-8 tw-rounded-full tw-transition-colors tw-duration-300 ${
          isMarkAsRead ? 'tw-bg-green-500' : 'tw-bg-gray-500'
        }`}
      >
        <span
          className={`tw-absolute tw-top-1 tw-left-1 tw-w-6 tw-h-6 tw-rounded-full tw-bg-white tw-shadow-md tw-flex tw-items-center tw-justify-center tw-transition-transform tw-duration-300 ${
            isMarkAsRead ? 'tw-transform tw-translate-x-8' : ''
          }`}
        >
          {isMarkAsRead ? (
            <svg
              viewBox="0 0 18 18"
              height="18"
              width="18"
              preserveAspectRatio="xMidYMid meet"
              className="tw-text-[#53bdeb]"
              version="1.1"
              x="0px"
              y="0px"
              enableBackground="new 0 0 18 18"
              xmlSpace="preserve"
            >
              <path
                fill="currentColor"
                d="M17.394,5.035l-0.57-0.444c-0.188-0.147-0.462-0.113-0.609,0.076l-6.39,8.198 c-0.147,0.188-0.406,0.206-0.577,0.039l-0.427-0.388c-0.171-0.167-0.431-0.15-0.578,0.038L7.792,13.13 c-0.147,0.188-0.128,0.478,0.043,0.645l1.575,1.51c0.171,0.167,0.43,0.149,0.577-0.039l7.483-9.602 C17.616,5.456,17.582,5.182,17.394,5.035z M12.502,5.035l-0.57-0.444c-0.188-0.147-0.462-0.113-0.609,0.076l-6.39,8.198 c-0.147,0.188-0.406,0.206-0.577,0.039l-2.614-2.556c-0.171-0.167-0.447-0.164-0.614,0.007l-0.505,0.516 c-0.167,0.171-0.164,0.447,0.007,0.614l3.887,3.8c0.171,0.167,0.43,0.149,0.577-0.039l7.483-9.602 C12.724,5.456,12.69,5.182,12.502,5.035z"
              ></path>
            </svg>
          ) : (
            <svg
              viewBox="0 0 18 18"
              height="18"
              width="18"
              preserveAspectRatio="xMidYMid meet"
              version="1.1"
              x="0px"
              y="0px"
              enableBackground="new 0 0 18 18"
              xmlSpace="preserve"
            >
              <path
                fill="currentColor"
                d="M17.394,5.035l-0.57-0.444c-0.188-0.147-0.462-0.113-0.609,0.076l-6.39,8.198 c-0.147,0.188-0.406,0.206-0.577,0.039l-0.427-0.388c-0.171-0.167-0.431-0.15-0.578,0.038L7.792,13.13 c-0.147,0.188-0.128,0.478,0.043,0.645l1.575,1.51c0.171,0.167,0.43,0.149,0.577-0.039l7.483-9.602 C17.616,5.456,17.582,5.182,17.394,5.035z M12.502,5.035l-0.57-0.444c-0.188-0.147-0.462-0.113-0.609,0.076l-6.39,8.198 c-0.147,0.188-0.406,0.206-0.577,0.039l-2.614-2.556c-0.171-0.167-0.447-0.164-0.614,0.007l-0.505,0.516 c-0.167,0.171-0.164,0.447,0.007,0.614l3.887,3.8c0.171,0.167,0.43,0.149,0.577-0.039l7.483-9.602 C12.724,5.456,12.69,5.182,12.502,5.035z"
              ></path>
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};

export default MarkAsRead;
