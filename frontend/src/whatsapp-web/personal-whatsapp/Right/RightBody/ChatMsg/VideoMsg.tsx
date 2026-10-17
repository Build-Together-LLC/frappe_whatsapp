import { getUrlOrText } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMsg/ChatMsg';

export interface IVideoChatUi {
  mimeType?: string;
  path: string;
  mediaCaption: string;
}

const VideoMsg = ({ mimeType, path, mediaCaption }: IVideoChatUi) => {
  return (
    <>
      <div className=" tw-max-w-[350px]">
        <video controls className="tw-w-full tw-rounded">
          <source src={path} type={mimeType || 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
      </div>
      {getUrlOrText(mediaCaption || '')}
    </>
  );
};
export default VideoMsg;
