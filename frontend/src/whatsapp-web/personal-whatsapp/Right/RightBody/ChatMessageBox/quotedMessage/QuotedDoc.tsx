import { IDocChatUi } from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatMsg/DocumentMsg';
import { DocumentTextIcon } from '@heroicons/react/20/solid';

const QuotedDoc = ({ title }: IDocChatUi) => {
  return (
    <div className="tw-max-h-[70px] tw-overflow-hidden  tw-p-1">
      <span className="tw-flex tw-justify-center tw-items-center tw-text-[16px]">
        <DocumentTextIcon className="tw-h-[20px] tw-text-red-500" />
        <p className="tw-m-0 tw-p-0 tw-text-[16px]">document</p>
      </span>
      {title && <p className="tw-m-0 tw-text-sm tw-text-[12px]">{title}</p>}
    </div>
  );
};
export default QuotedDoc;
