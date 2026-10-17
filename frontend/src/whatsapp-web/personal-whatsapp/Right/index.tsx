import ChatHeader from './ChatHeader';
import RightBody from '@/whatsapp-web/personal-whatsapp/Right/RightBody';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { useScreenSize } from '@/whatsapp-web/Hooks/useScreenSize';
import { useEffect, useState } from 'react';
import Sidebar from '@/whatsapp-web/personal-whatsapp/Right/sidebar';
import { useSearchParams } from 'react-router-dom';

const Index = () => {
  const { selectedUser } = useAppContext();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { isMobileView } = useScreenSize();
  const [searchParams] = useSearchParams();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (isMobileView) {
      if (selectedUser.isSelected) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else setIsVisible(true);
  }, [isMobileView, selectedUser.isSelected]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={` tw-w-0 tw-transition-all tw-grow  tw-relative tw-z-0 tw-flex `}
    >
      {isVisible && (
        <div
          className={` tw-flex-col tw-animate-fade tw-w-full ${screenWidth <= 1300 && searchParams.get('sidebar') ? 'tw-hidden' : 'tw-flex'}`}
        >
          {selectedUser.isSelected ? (
            <ChatHeader setIsVisible={setIsVisible} />
          ) : null}
          <RightBody />
        </div>
      )}
      <Sidebar />
    </div>
  );
};
export default Index;
