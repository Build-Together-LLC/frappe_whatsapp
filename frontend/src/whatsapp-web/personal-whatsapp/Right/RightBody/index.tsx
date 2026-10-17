import ChatMessageBox from './ChatMessageBox';
import ChatInput from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatInput';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import SelectOne from '@/whatsapp-web/personal-whatsapp/Right/RightBody/SelectOne';
import PreviewOfChosenFile from '@/whatsapp-web/personal-whatsapp/Right/RightBody/previewOfChosenFile';
import Scheduler from '@/whatsapp-web/personal-whatsapp/Right/RightBody/ChatInput/Scheduler';
import AssignUser from '@/whatsapp-web/personal-whatsapp/Right/ChatHeader/AssigneUsers/AssignUser';

const Index = () => {
  const { selectedUser, fileChosen } = useAppContext();
  return (
    <>
      {!fileChosen.length ? (
        <>
          <div
            className={`${selectedUser.isSelected ? 'tw-flex-grow' : 'tw-hidden'}  tw-mt-[53px] tw-mb-[62px] tw-overflow-y-auto tw-relative`}
          >
            <ChatMessageBox />
            <Scheduler />
            <AssignUser />
          </div>
          {selectedUser.isSelected ? <ChatInput /> : <SelectOne />}
        </>
      ) : (
        <>
          <PreviewOfChosenFile />
          <Scheduler />
          <AssignUser />
        </>
      )}
    </>
  );
};
export default Index;
