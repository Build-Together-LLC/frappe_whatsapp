import { useInView } from 'react-intersection-observer';
import ChatStatusIcon, {
  ChatStatus,
} from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatStatusIcon';
import {
  AudioChatUi,
  ChatUi,
  DocChatUi,
  ImgChatUi,
  VideoChatUi,
} from '../ChatMsg';
import { useEffect, useRef } from 'react';
import useMarkAsSeen from '@/whatsapp-web/personal-whatsapp/Query/useMarkedAsSeen';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useDetailApiCall } from '@/whatsapp-web/personal-whatsapp/Query/useDetailApiCall';
import QuotedMsg from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMessageBox/QuotedMsg';
import { useSearchParams } from 'react-router-dom';

export interface ChatMessage {
  body: string;
  caption: string;
  file_name: string;
  creation: string;
  media_url: string;
  message_body: string;
  message_type: string;
  mime_type: string;
  type: string;
  name: string;
  status: string;
  user_id: string;
  quoted_message_id: string;
  message_id: string;
}

interface ChatMessageComponentProps {
  msg: ChatMessage;
  userColorMap: any;
  allmsg: any;
  upView: boolean;
  showSenderName: boolean;
}

const ChatMessageComponent = ({
  msg: {
    body,
    caption,
    file_name,
    creation,
    media_url,
    message_type,
    mime_type,
    type,
    name,
    status,
    user_id,
    quoted_message_id,
    message_id,
  },
  userColorMap,
  allmsg,
  upView,
  showSenderName,
}: ChatMessageComponentProps) => {
  const selectedMessageView = useRef<HTMLDivElement | null>(null);
  const [searchParams] = useSearchParams();
  const userColor = userColorMap[user_id];
  const { ref, inView } = useInView();
  const isSent = type === 'Outgoing';
  const { mutate } = useMarkAsSeen();
  const { selectedUser, selectedMessage } = useAppContext();
  const { data: useDetail } = useDetailApiCall(user_id);
  let quotedMsg: any;
  let quotedMsgSender: any;

  useEffect(() => {
    if (inView && !isSent && status === 'Received' && selectedUser.markAsRead) {
      mutate({ msgName: name, sessionId: searchParams.get('session') || '' });
    }
  }, [inView, isSent, status]);

  useEffect(() => {
    if (selectedMessage && selectedMessage === message_id) {
      selectedMessageView.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedMessage, message_id]);
  if (quoted_message_id) {
    quotedMsg = allmsg.filter(
      (msgData: any) => msgData.message_id === quoted_message_id
    )[0];
  }
  if (quotedMsg && quotedMsg.user_id) {
    quotedMsgSender = quotedMsg.user_id;
  }
  const { data: quotedMsgSenderName } = useDetailApiCall(quotedMsgSender);

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
        if (message_type === 'Document') return DocChatUi;
        else if (message_type === 'Image') return ImgChatUi;
        else if (message_type === 'Video') return VideoChatUi;
        else if (message_type === 'Audio') return AudioChatUi;
        else if (message_type === 'Text') return ChatUi;
        else return null;
      })();
    }

    return (
      <div className="tw-w-full">
        {ChatComponent && <ChatComponent {...commonProps} />}
        <div className="tw-text-[#111b21] tw-max-w-full tw-text-[14.2px] tw-break-all tw-relative" />
      </div>
    );
  };

  return (
    <div ref={selectedMessageView}>
      <div
        className={`tw-flex tw-flex-row tw-mb-1.5 tw-group tw-mx-4 ${
          isSent && 'tw-justify-end'
        }`}
        ref={ref}
      >
        {!isSent && (
          <span className="tw-flex tw-text-white">
            <svg
              viewBox="0 0 8 13"
              height="13"
              width="8"
              preserveAspectRatio="xMidYMid meet"
              className=""
              version="1.1"
              x="0px"
              y="0px"
              enableBackground="new 0 0 8 13"
              xmlSpace="preserve"
            >
              <path
                opacity="0.13"
                fill="#0000000"
                d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"
              ></path>
              <path
                fill="currentColor"
                d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"
              ></path>
            </svg>
          </span>
        )}
        <div
          className={`tw-rounded-b-lg tw-flex-col tw-min-w-[128px] tw-relative tw-flex tw-pt-[6px] md:tw-max-w-2xl tw-max-w-[80%]  tw-p-2 ${
            isSent
              ? ` tw-rounded-tl-lg ${selectedMessage === message_id ? 'tw-bg-[#d1f0d1]' : 'tw-bg-[#c8fdc8]'}`
              : ` tw-min-w-[90px] tw-rounded-tr-lg ${selectedMessage === message_id ? 'tw-bg-gray-100' : 'tw-bg-white'}`
          }`}
        >
          {!isSent && selectedUser.chatType === 'Group' && showSenderName ? (
            <p
              style={{ color: userColor }}
              className="tw-text-[12px] tw-m-0 tw-p-0 tw-mb-1"
            >
              {useDetail?.message?.chat_name}
            </p>
          ) : null}

          {quoted_message_id && quotedMsg ? (
            <QuotedMsg
              quotedMsg={quotedMsg}
              quotedMsgId={quoted_message_id}
              quotedMsgSenderName={quotedMsgSenderName}
              userColor={userColorMap[quotedMsg.user_id]}
            />
          ) : null}

          <div className="tw-flex tw-max-w-[500px] tw-mb-[10px] ">
            {getChatComponent()}
          </div>
          <div className="tw-absolute tw-flex tw-gap-0.5 tw-bottom-0.5 tw-right-0 tw-whitespace-nowrap tw-pr-1">
            <div className="tw-font-normal tw-text-[#667781] tw-text-[10px] ">
              {new Date(
                window?.frappe?.datetime.convert_to_user_tz(creation) ||
                  creation
              ).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </div>

            <div className="tw-text-[#667781] tw-flex tw-items-end">
              {isSent && <ChatStatusIcon status={status as ChatStatus} />}
            </div>
          </div>
        </div>
        {isSent && (
          <span className="tw-flex tw-text-[#c8fdc8]">
            <svg
              viewBox="0 0 8 13"
              height="13"
              width="8"
              preserveAspectRatio="xMidYMid meet"
              className=""
              version="1.1"
              x="0px"
              y="0px"
              enableBackground="new 0 0 8 13"
              xmlSpace="preserve"
            >
              <path
                opacity="0.13"
                d="M5.188,1H0v11.193l6.467-8.625 C7.526,2.156,6.958,1,5.188,1z"
              ></path>
              <path
                fill="currentColor"
                d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z"
              ></path>
            </svg>
          </span>
        )}
      </div>
    </div>
  );
};
export default ChatMessageComponent;
