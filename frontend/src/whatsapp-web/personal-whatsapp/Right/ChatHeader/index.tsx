import ChatHeaderProfile from './ChatHeaderProfile/ChatHeaderProfile';
import { BackButton } from './BackButton';

const Index = ({ setIsVisible }: { setIsVisible: any }) => {
  return (
    <div
      className={` tw-flex tw-absolute tw-top-0 tw-justify-between tw-items-center tw-h-[53px] tw-w-full tw-p-2 tw-bg-white tw-border-b `}
    >
      <BackButton setIsVisible={setIsVisible} />
      <ChatHeaderProfile />
    </div>
  );
};
export default Index;
