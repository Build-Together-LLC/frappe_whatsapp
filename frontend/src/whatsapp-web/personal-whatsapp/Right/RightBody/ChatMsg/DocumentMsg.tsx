import {
  ArrowDownCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/20/solid';

export interface IDocChatUi {
  title: string;
  path: string;
  messageBody?: string;
}

const DocumentMsg = ({ title, path, messageBody }: IDocChatUi) => {
  const handleButtonClick = () => {
    window.location.href = path;
  };
  const fileName =
    path && path.length > 25
      ? `${path.substring(0, 20)}...${path.slice(-8)}`
      : path || '/';
  return (
    <div
      className={`tw-w-full tw-flex tw-flex-col ${
        messageBody ? '' : 'tw-align-center'
      }  tw-justify-center tw-gap-4 tw-max-w-[300px] tw-mb-6`}
    >
      <div>{title && <p className="tw-m-0 tw-text-sm">{title}</p>}</div>
      <div className="tw-flex-col tw-max-w-full tw-space-x-1">
        <DocumentTextIcon className="tw-h-[28px] tw-text-red-500" />
        {fileName && (
          <span className="tw-max-w-[100px] tw-truncate tw-text-sm tw-font-semibold tw-text-ellipsis tw-whitespace-normal tw-overflow-hidden">
            {fileName?.split('/')?.splice(-1)}
          </span>
        )}
        <ArrowDownCircleIcon
          className="tw-h-[30px] tw-text-gray-500 tw-opacity-70 tw-cursor-pointer"
          onClick={handleButtonClick}
        />
      </div>
      {messageBody && (
        <div
          className="tw-text-[#111b21] tw-max-w-full tw-text-[14.2px] tw-break-all tw-relative"
          dangerouslySetInnerHTML={{
            __html: messageBody?.replace(/\n/g, '<br/>'),
          }}
        ></div>
      )}
    </div>
  );
};
export default DocumentMsg;
