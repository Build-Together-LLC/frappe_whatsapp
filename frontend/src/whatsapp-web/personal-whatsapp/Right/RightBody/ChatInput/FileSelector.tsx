import { useEffect, useRef, useState } from 'react';
import { HiOutlinePaperClip } from 'react-icons/hi';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { CiVideoOn } from 'react-icons/ci';

const FileSelector = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { setFileChosen, setMessageType } = useAppContext();

  // Define the types for the refs using HTML elements
  const popupRef = useRef<HTMLDivElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsPopupVisible(false);
      }
    };

    if (isPopupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupVisible]);

  const handleDocumentClick = () => {
    documentInputRef.current?.click();
    setMessageType('Document');
  };

  const handlePhotoClick = () => {
    photoInputRef.current?.click();
    setMessageType('Image');
  };
  const handleVideoClick = () => {
    videoInputRef.current?.click();
    setMessageType('Video');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileChosen(event.target.files);
  };

  return (
    <div>
      <button className="tw-rounded-full tw-p-2" onClick={togglePopup}>
        <HiOutlinePaperClip size={24} />
      </button>

      {isPopupVisible && (
        <div
          className="tw-absolute tw-bottom-16 tw-left-0 tw-bg-gray-200 tw-rounded-lg tw-shadow-lg tw-p-2"
          ref={popupRef}
        >
          <div className="tw-flex tw-flex-col">
            <button
              className="tw-p-2 tw-hover:bg-gray-100 tw-rounded-lg tw-flex tw-items-center"
              onClick={handleDocumentClick}
            >
              <span className="tw-ml-2">📄 Document</span>
            </button>
            <button
              className="tw-p-2 tw-hover:bg-gray-100 tw-rounded-lg tw-flex tw-items-center"
              onClick={handlePhotoClick}
            >
              <span className="tw-ml-2">📷 Photos</span>
            </button>
            <button
              className="tw-p-2 tw-hover:bg-gray-100 tw-rounded-lg tw-flex tw-items-center"
              onClick={handleVideoClick}
            >
              <span className="tw-ml-2">
                <CiVideoOn /> Videos
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs for documents and photos */}
      <input
        type="file"
        ref={documentInputRef}
        className="tw-hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
      />
      <input
        type="file"
        ref={photoInputRef}
        className="tw-hidden"
        onChange={handleFileChange}
        accept="image/*,video/*"
      />
      <input
        type="file"
        ref={videoInputRef}
        className="tw-hidden"
        onChange={handleFileChange}
        accept="video/*"
      />
    </div>
  );
};

export default FileSelector;
