import { IoIosCamera } from 'react-icons/io';
import { getUrlOrText } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMsg/ChatMsg';

const QuotedImage = ({
  mediaCaption,
  path,
  title,
}: {
  mediaCaption: string | null;
  path: string;
  title: string | '';
}) => {
  return (
    <div className="tw-flex">
      <div className="tw-flex tw-items-center tw-p-1">
        <span className="tw-flex tw-items-center">
          <IoIosCamera className="tw-h-[20px] tw-w-[20px]" />
          <p className="tw-m-0 tw-p-0 tw-text-[16px]">Photo</p>
        </span>
        {mediaCaption ? (
          <span className="tw-overflow-hidden tw-truncate tw-whitespace-nowrap tw-break-word tw-max-h-[20px]">
            {getUrlOrText(mediaCaption)}
          </span>
        ) : null}
      </div>
      <img src={path} alt={title} className="tw-rounded tw-w-[70px] " />
    </div>
  );
};
export default QuotedImage;
