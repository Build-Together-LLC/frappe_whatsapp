import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';

export const BackButton = ({ setIsVisible }: any) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSelectedUser, setFileChosen } = useAppContext();

  const handleChatCleanup = () => {
    setIsVisible(false);
  };

  const backArrowClickHandler = () => {
    handleChatCleanup();
    setSelectedUser({
      chatType: '',
      id: '',
      isSelected: false,
      profilePicture: '',
      name: undefined,
    });
    setFileChosen([]);
    if (searchParams.get('contact')) {
      searchParams.delete('contact');
      setSearchParams(searchParams);
    }
    if (searchParams.get('group')) {
      searchParams.delete('group');
      setSearchParams(searchParams);
    }
  };
  return (
    <button
      onClick={() => {
        backArrowClickHandler();
      }}
      className="tw-bg-white"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/109/109618.png"
        alt="back"
        className="tw-h-[20px] tw-w-[20px] md:tw-hidden md:tw-h-[0px] md:tw-w-[0px]"
      />
    </button>
  );
};
