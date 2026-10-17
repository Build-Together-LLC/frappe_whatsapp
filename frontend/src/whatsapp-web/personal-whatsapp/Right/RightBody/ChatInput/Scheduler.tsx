import ReactDatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
const DatePicker = ReactDatePicker as any;
import { Fragment, useState } from 'react';
import en from 'date-fns/locale/en-US';
import { Dialog, Transition } from '@headlessui/react';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useSearchParams } from 'react-router-dom';
import useSendPersonalWhatsappMessage from '@/whatsapp-web/personal-whatsapp/Query/useSendPersonalWhatsappMessage';
import { File } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/previewOfChosenFile/PreviewOfFile';
import useUploadFile from '@/whatsapp-web/personal-whatsapp/Query/UseUploadFile';

registerLocale('en', en);

const Scheduler = () => {
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState<Date>();
  const {
    isOpen,
    setIsOpen,
    selectedUser,
    selectedSessionUserId,
    message,
    setMessage,
    setFileChosen,
    fileChosen,
    setMessageType,
    caption,
    setCaption,
    messageType,
  } = useAppContext();
  const { mutateAsync: sendScheduledUploadMessage } =
    useSendPersonalWhatsappMessage(true);
  const { mutateAsync: uploadAsync } = useUploadFile();

  const formatDateForFrappe = (dateTime: Date | undefined) => {
    if (dateTime) {
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0');
      const day = String(dateTime.getDate()).padStart(2, '0');
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      const seconds = String(dateTime.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    return dateTime;
  };

  const scheduleTextMsgSendHandler = () => {
    const session = searchParams.get('session');
    if (session) {
      if (message) {
        sendScheduledUploadMessage({
          session: session,
          type: 'Outgoing',
          message_type: 'Text',
          conversation_type: selectedUser.chatType,
          user_id:
            selectedUser.chatType === 'Personal'
              ? selectedUser.id
              : selectedSessionUserId,
          group_id: selectedUser.chatType === 'Group' ? selectedUser.id : null,
          body: message,
          status: 'Scheduled',
          mime_type: null,
          media_url: null,
          file_name: null,
          caption: null,
          scheduled_at: formatDateForFrappe(date),
        }).then(() => {
          setMessage('');
          setIsOpen(false);
        });
      }
    }
  };

  const scheduleMediaMsgSendHandler = (data: any) => {
    const session = searchParams.get('session');
    const file: File = fileChosen[0];
    sendScheduledUploadMessage({
      session: session,
      type: 'Outgoing',
      message_type: messageType,
      conversation_type: selectedUser.chatType,
      user_id:
        selectedUser.chatType === 'Personal'
          ? selectedUser.id
          : selectedSessionUserId,
      group_id: selectedUser.chatType === 'Group' ? selectedUser.id : null,
      body: null,
      mime_type: file.type,
      media_url: data?.message?.file_url,
      file_name: data?.message?.file_name,
      caption: caption,
      scheduled_at: formatDateForFrappe(date),
      status: 'Scheduled',
    }).then(() => {
      setCaption('');
      setFileChosen([]);
      setIsOpen(false);
      setMessageType('');
    });
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="tw-relative tw-z-[1000]"
          onClose={() => setIsOpen(false)}
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
                  className={`tw-w-full tw-px-4 tw-py-6 tw-max-w-md ${
                    showCalendar ? 'tw-h-96' : 'tw-h-40'
                  }  tw-transform tw-overflow-hidden tw-rounded-2xl tw-bg-white p-6 tw-text-left tw-align-middle tw-shadow-xl tw-transition-all`}
                >
                  <p className="tw-mb-2">Scheduled At:</p>
                  <div className="date-picker-container tw-py-2.5 tw-px-2 tw-h-8 tw-rounded  tw-flex tw-items-center tw-mr-2 tw-border  tw-border-secondary-200">
                    {/*<DateIcon className="tw-mr-2 " />*/}
                    <DatePicker
                      onCalendarClose={() => setShowCalendar(false)}
                      onCalendarOpen={() => setShowCalendar(true)}
                      selected={date}
                      dateFormat="yyyy-MM-dd HH:mm:ss"
                      showTimeSelect
                      locale="en"
                      className="tw-outline-none tw-flex-1 tw-block tw-w-auto tw-text-gray-150 tw-text-xs tw-mb-0"
                      onChange={(updatedDate: Date) => {
                        setDate(updatedDate);
                      }}
                    />
                  </div>
                  <div className="tw-mt-6 tw-flex tw-justify-end tw-gap-2">
                    <button
                      onClick={() => {
                        if (message) {
                          scheduleTextMsgSendHandler();
                        } else {
                          uploadAsync(fileChosen[0]).then((data) => {
                            scheduleMediaMsgSendHandler(data);
                          });
                        }
                      }}
                      className="tw-bg-green-50 tw-cursor-pointer tw-text-sm tw-outline-none focus:tw-outline-none  text-white  tw-py-1.5 tw-px-2 tw-rounded"
                    >
                      Schedule
                    </button>
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
export default Scheduler;
