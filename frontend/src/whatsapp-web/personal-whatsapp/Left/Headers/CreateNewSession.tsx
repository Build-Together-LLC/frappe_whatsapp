import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import useCreateNewSession from '@/whatsapp-web/personal-whatsapp/Query/useCreateNewSession';
import { LeftSidebarProps } from '@/whatsapp-web/Components/Shared/LeftSideBar';

const CreateNewSession = ({
  setIsSessionCreatePopup,
  isSessionCreatePopup,
}: LeftSidebarProps) => {
  const { mutateAsync } = useCreateNewSession();
  const [sessionName, setSessionName] = useState('');
  const handleCreateSession = () => {
    mutateAsync({ sessionName }).then(() => {
      setIsSessionCreatePopup(false);
      setSessionName('');
    });
  };
  return (
    // isSessionCreatePopupOpen
    <>
      <Transition appear show={isSessionCreatePopup} as={Fragment}>
        <Dialog
          as="div"
          className="tw-relative tw-z-[1000] "
          onClose={() => setIsSessionCreatePopup(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-25" />
          </Transition.Child>
          <div className="tw-fixed tw-inset-0 tw-overflow-y-auto">
            <div className="tw-flex tw-min-h-full tw-items-center tw-justify-center tw-p-4 tw-text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`tw-w-full tw-px-2 tw-py-3 tw-max-w-[500px] tw-max-h-[600px]   tw-transform tw-rounded-2xl tw-bg-white tw-text-left tw-align-middle tw-shadow-xl tw-transition-all`}
                >
                  <div className="tw-flex tw-flex-col tw-gap-4 tw-p-4 ">
                    <input
                      className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-outline-none tw-transition tw-duration-200 focus:tw-border-green-500 focus:tw-ring-2 focus:tw-ring-green-400"
                      value={sessionName}
                      type="text"
                      onChange={(e) => setSessionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateSession();
                        }
                      }}
                      placeholder="Enter session name"
                    />
                    <input
                      className="tw-px-4 tw-py-2 tw-bg-green-500 tw-text-white tw-font-semibold tw-rounded-lg tw-cursor-pointer hover:tw-bg-green-600 tw-transition tw-duration-200"
                      type="submit"
                      value="Submit"
                      onClick={handleCreateSession}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
export default CreateNewSession;
