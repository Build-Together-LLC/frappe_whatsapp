import { getUrlOrText } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMsg/ChatMsg';

const QuotedChat = ({ messageBody }: { messageBody: string }) => {
  return <div>{getUrlOrText(messageBody)}</div>;
};
export default QuotedChat;
