import { ChatSendIcon } from '@/whatsapp-web/assets/icons';
import useUploadFile from '@/whatsapp-web/personal-whatsapp/Query/UseUploadFile';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import useSendPersonalWhatsappMessage from '@/whatsapp-web/personal-whatsapp/Query/useSendPersonalWhatsappMessage';
import { useSearchParams } from 'react-router-dom';
import { File } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/previewOfChosenFile/PreviewOfFile';
import { MdScheduleSend } from 'react-icons/md';

const DescriptionInput = () => {
  const {
    fileChosen,
    selectedUser,
    setFileChosen,
    messageType,
    setMessageType,
    selectedSessionUserId,
    setIsOpen,
    caption,
    setCaption,
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const { mutateAsync: uploadAsync, isLoading } = useUploadFile();
  const { mutateAsync: sendUploadMessage } = useSendPersonalWhatsappMessage();

  const file: File = fileChosen[0];

  const handleSubmit = (data: any) => {
    const session = searchParams.get('session');
    sendUploadMessage({
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
    }).then(() => {
      setCaption('');
      setFileChosen([]);
      setMessageType('');
    });
  };

  return (
    <div className="tw-flex tw-absolute tw-bottom-0 tw-min-h-[62px] tw-max-h-[800px] tw-items-center tw-w-full tw-bg-[#f0f2f5]">
      <div className="tw-flex tw-flex-grow tw-ml-2 tw-items-center tw-min-h-[40px] tw-rounded-md tw-bg-white tw-px-4 tw-py-1.5 tw-h-auto tw-max-h-[770px] tw-my-1">
        <textarea
          onChange={(e) => {
            setCaption(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              uploadAsync(fileChosen[0]).then((data) => {
                handleSubmit(data);
              });
            }
          }}
          value={caption}
          placeholder="Type Description"
          className="tw-overflow-hidden tw-resize-none tw-font-normal placeholder:tw-text-[#3b4a54] tw-max-h-[200px] tw-text-sm  tw-h-[1.5em] tw-w-[100%] tw-border-none tw-outline-none"
        ></textarea>
      </div>
      <div className="tw-w-[40px] tw-h-[40px] tw-flex tw-justify-center tw-items-center tw-ml-2">
        <button
          disabled={isLoading}
          onClick={() => {
            uploadAsync(fileChosen[0]).then((data) => {
              handleSubmit(data);
            });
          }}
        >
          <ChatSendIcon />
        </button>
      </div>
      <div className="tw-w-[40px] tw-h-[40px] tw-flex tw-justify-center tw-items-center tw-mr-2">
        <button className="tw-mr-2 tw-p-2" onClick={() => setIsOpen(true)}>
          <MdScheduleSend size={26} />
        </button>
      </div>
    </div>
  );
};
export default DescriptionInput;
