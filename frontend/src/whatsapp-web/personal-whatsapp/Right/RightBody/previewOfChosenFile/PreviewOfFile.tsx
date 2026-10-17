import { useState } from 'react';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { IoDocumentOutline } from 'react-icons/io5';
import DescriptionInput from '@/whatsapp-web/personal-whatsapp/Right/RightBody/previewOfChosenFile/DescriptionInput';

export interface File {
  lastModified: number;
  lastModifiedDate: string;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}

const PreviewOfFile = () => {
  const [filePreview, setFilePreview] = useState<any>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileDetailPreview, setFileDetailPreview] = useState<string | null>(
    null
  );
  const { fileChosen } = useAppContext();

  const formatFileSize = (file: File) => {
    if (file.size < 1024)
      return file.size + ' Bytes' + ' ' + file.type.split('/')[1].toUpperCase();
    else if (file.size < 1024 * 1024)
      return (
        (file.size / 1024).toFixed(2) +
        ' KB' +
        ' ' +
        file.type.split('/')[1].toUpperCase()
      );
    else if (file.size < 1024 * 1024 * 1024)
      return (
        (file.size / (1024 * 1024)).toFixed(2) +
        ' MB' +
        ' ' +
        file.type.split('/')[1].toUpperCase()
      );
    else
      return (
        (file.size / (1024 * 1024 * 1024)).toFixed(2) +
        ' GB' +
        file.type.split('/')
      );
  };

  const file: File = fileChosen[0] || null;
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
      setFileType(file.type);
      setFileDetailPreview(formatFileSize(file));
    };
    reader.readAsDataURL(fileChosen[0]);
  }
  const isImage = fileType?.startsWith('image/');
  return (
    <div>
      {isImage ? (
        <>
          <div className="tw-flex tw-justify-center ">
            <img src={filePreview} alt="Preview" className=" tw-w-[70%]" />
          </div>
          <p className="tw-text-center">{fileDetailPreview}</p>
        </>
      ) : (
        <div className="">
          <div className="tw-text-center tw-mb-2">
            <IoDocumentOutline size={50} />
          </div>
          <h5 className="tw-text-center">No preview available</h5>
          <p className="tw-text-center">{fileDetailPreview}</p>
        </div>
      )}
      <DescriptionInput />
    </div>
  );
};
export default PreviewOfFile;
