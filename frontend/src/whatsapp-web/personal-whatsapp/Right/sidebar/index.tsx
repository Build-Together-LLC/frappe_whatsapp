import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SidebarHeader from '@/whatsapp-web/personal-whatsapp/Right/sidebar/SidebarHeader';
import SideBarContactInfo from '@/whatsapp-web/personal-whatsapp/Right/sidebar/sideBarContactInfo';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [isContentVisible, setIsContentVisible] = useState<boolean>(false);

  useEffect(() => {
    if (
      (searchParams.get('contact') || searchParams.get('group')) &&
      searchParams.get('sidebar')
    )
      setTimeout(() => setIsContentVisible(true), 100);
    else setIsContentVisible(false);
  }, [searchParams]);
  return (
    <div
      className={`${
        (searchParams.get('contact') || searchParams.get('group')) &&
        searchParams.get('sidebar')
          ? 'tw-w-full'
          : 'tw-w-0'
      } tw-bg-white tw-flex tw-flex-col tw-border tw-border-l-2 tw-border-gray-200 tw-transition-all tw-overflow-y-auto tw-z-50`}
    >
      {isContentVisible && (
        <div
          className={'tw-animate-fade tw-flex-grow tw-flex tw-flex-col tw-p-2'}
        >
          <SidebarHeader />
          <SideBarContactInfo />
        </div>
      )}
    </div>
  );
};
export default Index;
