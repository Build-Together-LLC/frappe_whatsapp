import { getUrlOrText } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMsg/ChatMsg';

const ImageMsg = ({
  mediaCaption,
  path,
  title,
}: {
  mediaCaption: string | null;
  path: string;
  title: string | '';
}) => {
  const handleClick = () => {
    window.open(path);
  };
  return (
    <div className="tw-w-full">
      <div className="tw-max-w-[350px] tw-mb-[13px]" onClick={handleClick}>
        <img src={path} alt={title} className="tw-rounded tw-w-full " />
      </div>
      {getUrlOrText(mediaCaption || '')}
    </div>
  );
};
export default ImageMsg;
