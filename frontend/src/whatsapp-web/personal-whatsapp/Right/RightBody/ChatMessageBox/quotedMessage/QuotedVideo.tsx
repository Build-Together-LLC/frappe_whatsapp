import { IVideoChatUi } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMsg/VideoMsg';
import { getUrlOrText } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMsg/ChatMsg';
import { MdOutlineVideocam } from 'react-icons/md';

const QuotedVideo = ({ mediaCaption }: IVideoChatUi) => {
  return (
    <div className=" tw-max-w-[70px] tw-p-1">
      <span className="tw-flex tw-justify-center tw-items-center tw-text-[16px]">
        <MdOutlineVideocam className="tw-h-[20px] tw-w-[20px]" />
        <p className="tw-m-0 tw-p-0 tw-text-[16px]">video</p>
      </span>
      {getUrlOrText(mediaCaption || '')}
    </div>
  );
};
export default QuotedVideo;
