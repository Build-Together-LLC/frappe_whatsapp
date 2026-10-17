import PreviewOfFile from '@/whatsapp-web/personal-whatsapp/Right/RightBody/previewOfChosenFile/PreviewOfFile';
import { RxCross1 } from 'react-icons/rx';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';

const Index = () => {
  const { setFileChosen } = useAppContext();
  const handleClick = () => {
    setFileChosen([]);
  };
  return (
    <>
      <div
        className={`tw-flex-grow  tw-mt-[53px] tw-overflow-y-auto tw-relative tw-bg-[#efeae2]`}
      >
        <div className="tw-w-full tw-absolute tw-top-8 tw-text-right tw-pr-3">
          <span onClick={handleClick}>
            <RxCross1 size={25} />
          </span>
        </div>
        <div className="tw-h-full tw-flex tw-flex-col-reverse tw-justify-center">
          <PreviewOfFile />
        </div>
      </div>
    </>
  );
};
export default Index;
