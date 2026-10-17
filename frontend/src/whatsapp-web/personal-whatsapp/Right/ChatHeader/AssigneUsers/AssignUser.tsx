import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import AssignedUserList from '@/whatsapp-web/personal-whatsapp/Right/ChatHeader/AssigneUsers/AssignedUser';
import { GoPeople } from 'react-icons/go';
import AssignToUser from '@/whatsapp-web/personal-whatsapp/Right/ChatHeader/AssigneUsers/AssignToUser';
import { RxCross2 } from 'react-icons/rx';

const AssignUser = () => {
  const { assignUserToContactView, setAssignUserToContactView } =
    useAppContext();
  return (
    <>
      <Transition appear show={assignUserToContactView} as={Fragment}>
        <Dialog
          as="div"
          className="tw-relative tw-z-[900] "
          onClose={() => setAssignUserToContactView(false)}
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
                  className={`tw-w-full tw-px-2 tw-py-3 tw-max-w-md   tw-transform tw-rounded-2xl tw-bg-white tw-text-left tw-align-middle tw-shadow-xl tw-transition-all`}
                >
                  <div className="tw-min-h-[300px] tw-max-h-[450px]">
                    <div className={'tw-w-full tw-flex tw-justify-end '}>
                      <RxCross2
                        size={24}
                        className={'hover:tw-text-red-500 tw-cursor-pointer'}
                        onClick={() => setAssignUserToContactView(false)}
                      />
                    </div>
                    <div className="tw-flex tw-items-center tw-relative tw-mb-2">
                      <span
                        className={`tw-w-full tw-text-center tw-flex tw-gap-2 tw-justify-center`}
                      >
                        <GoPeople className="tw-text-[20px] tw-text-gray-400" />
                        <span className=" tw-text-[15px] tw-font-medium tw-text-[#656a6b]">
                          Assigned to
                        </span>
                      </span>
                    </div>
                    <div className="tw-z-20">
                      <AssignToUser />
                    </div>
                    <div className="tw-overflow-auto tw-max-h-[220px] tw-mb-2">
                      <AssignedUserList />
                    </div>
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
export default AssignUser;
