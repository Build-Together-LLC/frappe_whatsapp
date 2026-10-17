import { useRef } from 'react';
import useOutsideClick from '@/shared/OutsideClick';

interface IMoreActionOnUser {
  options: {
    label: string;
    onPress: () => void;
  }[];
  onClose: () => void;
}

const MoreOptionDropDown = ({ options, onClose }: IMoreActionOnUser) => {
  const popupRef = useRef<HTMLDivElement>(null);
  useOutsideClick(popupRef, onClose);
  return (
    <div
      ref={popupRef}
      className={
        'tw-z-[10000] tw-absolute tw-right-[1px] tw-top-[25px]  tw-bg-white tw-w-[220px] tw-drop-shadow-lg tw-rounded-md w-ring-1 tw-ring-black tw-ring-opacity-5 tw-focus:outline-none tw-shadow-indigo-200 tw-py-2'
      }
    >
      {options.map((option, index) => (
        <div
          key={index}
          onClick={option.onPress}
          className={
            'tw-px-5 tw-py-2 hover:tw-bg-gray-200 tw-text-[#3b4a54] tw-text-sm tw-cursor-pointer'
          }
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};
export default MoreOptionDropDown;
