import { ChatMessage } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMessageBox/ChatMessageComponent';
import {
  QuotedChatUi,
  QuotedDocsChat,
  QuotedImageChat,
  QuotedVideoChat,
} from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMessageBox/quotedMessage';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';

const QuotedMsg = ({
  quotedMsg: {
    body,
    caption,
    file_name,
    media_url,
    message_type,
    mime_type,
    type,
  },
  quotedMsgId,
  userColor,
  quotedMsgSenderName,
}: {
  quotedMsg: ChatMessage;
  quotedMsgSenderName: any;
  userColor: any;
  quotedMsgId: string;
}) => {
  const { setSelectedMessage } = useAppContext();
  const handleClickQuotedMessage = () => {
    setSelectedMessage(quotedMsgId);
    setTimeout(() => {
      setSelectedMessage('');
    }, 1000);
  };
  const getChatComponent = () => {
    const commonProps = {
      title:
        file_name && file_name.length > 25
          ? `${file_name.substring(0, 20)}...${file_name.slice(-8)}`
          : file_name || '',
      path: media_url || '/',
      mimeType: mime_type || '',
      mediaCaption: caption || '',
      messageBody: body || '',
    };

    let ChatComponent;

    if (message_type) {
      ChatComponent = (() => {
        if (message_type === 'Document') return QuotedDocsChat;
        else if (message_type === 'Image') return QuotedImageChat;
        else if (message_type === 'Video') return QuotedVideoChat;
        // else if (message_type === 'Audio') return AudioChatUi;
        else if (message_type === 'Text') return QuotedChatUi;
        else return null;
      })();
    }
    return (
      <div className="tw-w-full tw-min-w-0">
        {ChatComponent && <ChatComponent {...commonProps} />}
        <div className="tw-text-[#111b21] tw-max-w-full tw-text-[14.2px] tw-break-all tw-relative" />
      </div>
    );
  };
  return (
    <div
      className="tw-bg-[#0912181a] tw-flex tw-rounded tw-max-w-[450px]"
      onClick={handleClickQuotedMessage}
    >
      <div
        style={{ background: type === 'Incoming' ? userColor : '#3B82F6' }}
        className={`tw-w-[6px] tw-h-full  tw-mr-0.5 tw-rounded`}
      ></div>
      <div className="tw-min-w-0 tw-flex-1">
        <p
          style={{ color: type === 'Incoming' ? userColor : '#3B82F6' }}
          className="tw-text-[12px] tw-m-0 tw-p-0 tw-mb-1"
        >
          {type === 'Incoming'
            ? quotedMsgSenderName?.message?.chat_name
            : 'you'}
        </p>
        <div className="tw-flex tw-min-w-0 tw-max-w-[450px]">
          {getChatComponent()}
        </div>
      </div>
    </div>
  );
};
export default QuotedMsg;
