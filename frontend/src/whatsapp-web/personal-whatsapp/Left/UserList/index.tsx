import UserListComponent from '@/whatsapp-web/personal-whatsapp/Left/UserList/UserListComponent';
import Searchbar from '@/whatsapp-web/personal-whatsapp/Left/SearchBar';

const Index = () => {
  return (
    <>
      <Searchbar />
      <div className="tw-flex-grow tw-flex tw-flex-col tw-overflow-y-auto tw-z-0">
        <UserListComponent />
      </div>
    </>
  );
};
export default Index;
