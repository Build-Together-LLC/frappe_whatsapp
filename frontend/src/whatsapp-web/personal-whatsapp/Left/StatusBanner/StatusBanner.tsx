import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { IoReload } from 'react-icons/io5';
import { VscDebugStart } from 'react-icons/vsc';
import { ImQrcode } from 'react-icons/im';
import useStartSession from '@/whatsapp-web/personal-whatsapp/Query/useStartSession';
import { useEffect, useState } from 'react';

const StatusBanner = () => {
  const { selectedSessionDetail, setIsViewQrCode } = useAppContext();
  const [status, setStatus] = useState<string>();
  const { mutate: startSession } = useStartSession();

  useEffect(() => {
    if (selectedSessionDetail.status) {
      setStatus(selectedSessionDetail.status);
    }
  }, [selectedSessionDetail]);
  const getStatusClasses = () => {
    if (status === 'FAILED') {
      return 'tw-bg-[#ff5053] tw-border-red-700 tw-text-white';
    } else if (status === 'DELETED') {
      return 'tw-bg-[#969696] tw-border-gray-700 tw-text-white';
    } else if (status === 'SCAN_QR_CODE' || status === 'STARTING') {
      return 'tw-bg-green-500 tw-border-green-700';
    } else if (status === 'STOPPED') {
      return 'tw-bg-[#FACC14] tw-border-[#CA8A04] tw-text-[#606060]';
    }
  };
  const handleStart = () => {
    startSession(selectedSessionDetail.name);
  };
  const handleReload = () => {
    startSession(selectedSessionDetail.name);
  };
  const viewQrCode = () => {
    setIsViewQrCode(true);
  };
  if (status == 'WORKING') return null;
  return (
    <div
      className={`${getStatusClasses()} tw-shadow-lg tw-flex tw-items-center tw-justify-between tw-p-0.5 tw-px-3 tw-gap-2`}
    >
      {status === 'FAILED' || status === 'SCAN_QR_CODE' ? (
        <span
          className={'tw-p-0.5 tw-font-bold tw-text-left tw-cursor-pointer'}
          onClick={handleReload}
        >
          <IoReload size={24} />
        </span>
      ) : null}
      <span className="tw-flex-1 tw-font-semibold tw-text-white  tw-text-center">
        {status || ''}
      </span>
      {status === 'STOPPED' ? (
        <span
          className="tw-p-0.5 tw-font-bold tw-text-right tw-cursor-pointer"
          onClick={handleStart}
        >
          <VscDebugStart size={24} />
        </span>
      ) : null}
      {status === 'SCAN_QR_CODE' ? (
        <span
          className={'tw-p-0.5 tw-font-bold tw-text-right tw-cursor-pointer'}
          onClick={viewQrCode}
        >
          <ImQrcode size={24} />
        </span>
      ) : null}
    </div>
  );
};

export default StatusBanner;
