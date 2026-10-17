import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import PersonalWhatsappApp from '@/whatsapp-web/personal-whatsapp/PersonalWhatsappApp';
import { personalWhatsappQueryClient } from '@/whatsapp-web/personal-whatsapp/Query';
import LeftSidebar from '@/whatsapp-web/Components/Shared/LeftSideBar';
import CreateNewSession from '@/whatsapp-web/personal-whatsapp/Left/Headers/CreateNewSession';
import './whatsapp-web/App.css';

const Inbox = () => {
  const [isSessionCreatePopup, setIsSessionCreatePopup] = useState(false);
  return (
    <QueryClientProvider client={personalWhatsappQueryClient}>
      <LeftSidebar
        setIsSessionCreatePopup={setIsSessionCreatePopup}
        isSessionCreatePopup={isSessionCreatePopup}
      />
      <PersonalWhatsappApp />
      <CreateNewSession
        setIsSessionCreatePopup={setIsSessionCreatePopup}
        isSessionCreatePopup={isSessionCreatePopup}
      />
    </QueryClientProvider>
  );
};

export const App = () => (
  <BrowserRouter>
    <div className="tw-w-full tw-flex tw-justify-center tw-items-center tw-relative tw-h-[100dvh]">
      <div className="tw-flex tw-h-full tw-bg-white tw-w-full md:tw-min-w-[748px] tw-shadow-2xl">
        <Inbox />
      </div>
    </div>
  </BrowserRouter>
);

export default App;
