import { ChatSendIcon } from '@/whatsapp-web/assets/icons';
import { useEffect, useRef } from 'react';
import FileSelector from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatInput/FileSelector';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import useSendPersonalWhatsappMessage from '@/whatsapp-web/personal-whatsapp/Query/useSendPersonalWhatsappMessage';
import { useSearchParams } from 'react-router-dom';
import { MdScheduleSend } from 'react-icons/md';

const Index = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    selectedUser,
    selectedSessionUserId,
    setIsOpen,
    message,
    setMessage,
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const { mutateAsync: sendUploadMessage } = useSendPersonalWhatsappMessage();

  const handleSubmit = () => {
    const session = searchParams.get('session');
    if (session) {
      sendUploadMessage({
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
        mime_type: null,
        media_url: null,
        file_name: null,
        caption: null,
      }).then((data) => {
        setMessage('');
        console.log(data);
      });
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const height = textareaRef.current.scrollHeight - 20;
      textareaRef.current.style.height = `${height}px`;
    }
  }, [message]);

  const handleClick = () => {};
  return (
    <div className="tw-flex tw-absolute tw-bottom-0 tw-min-h-[62px] tw-max-h-[800px] tw-items-center tw-w-full tw-bg-[#f0f2f5]">
      <div onClick={handleClick} className="tw-border-0">
        <FileSelector />
      </div>
      <div className="tw-flex tw-flex-grow tw-ml-2 tw-items-center tw-min-h-[40px] tw-rounded-md tw-bg-white tw-px-4 tw-py-1.5 tw-h-auto tw-max-h-[770px] tw-my-1">
        <textarea
          ref={textareaRef}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && message.length && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          value={message}
          placeholder="Type a message"
          className=" tw-resize-none tw-font-normal placeholder:tw-text-[#3b4a54] tw-max-h-[200px] tw-text-sm tw-w-[100%] tw-border-none tw-outline-none"
        ></textarea>
      </div>
      <div className="tw-w-[40px] tw-h-[40px] tw-flex tw-justify-center tw-items-center tw-ml-2">
        <button
          disabled={!message.length}
          onClick={() => {
            handleSubmit();
          }}
          className="tw-p-2 tw-mr-2"
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
export default Index;
