import { AppContextProvider } from './Context/AppContext';
import Right from './Right';
import Left from './Left';

const PersonalWhatsappApp = () => {
  return (
    <AppContextProvider>
      <Left />
      <Right />
    </AppContextProvider>
  );
};
export default PersonalWhatsappApp;
