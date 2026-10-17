import { useNavigate } from 'react-router-dom';
import { IoMdClose } from 'react-icons/io';

const SidebarHeader = () => {
  const navigate = useNavigate();
  const setSidebarClose = () => {
    navigate(-1);
  };
  return (
    <div
      className={
        'tw-w-full  tw-flex tw-justify-between tw-items-center tw-flex-col'
      }
    >
      <div className={'tw-w-full  tw-flex tw-items-center'}>
        <span className={' tw-rounded tw-mr-5 '} onClick={setSidebarClose}>
          <IoMdClose size={30} />
        </span>
        <span className={'tw-text-[22px] tw-shrink-0'}>Contact Info</span>
        <div
          className={
            'tw-flex-grow tw-flex tw-flex-col tw-justify-center tw-items-center'
          }
        ></div>
      </div>
    </div>
  );
};
export default SidebarHeader;
