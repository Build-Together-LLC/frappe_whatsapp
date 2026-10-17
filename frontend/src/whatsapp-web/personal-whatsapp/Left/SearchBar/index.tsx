import SearchBarButton from './searchButton';
import FilterDropDown from '@/whatsapp-web/personal-whatsapp/Left/SearchBar/FilterDropDown';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import { HiUserGroup } from 'react-icons/hi2';

function Index() {
  const {
    setChatSearch,
    chatSearch,
    setCreateNewGroup,
    createNewGroup,
    setArchivedView,
  } = useAppContext();

  const handleCreateGroup = () => {
    if (!createNewGroup) {
      setCreateNewGroup(true);
      setArchivedView(false);
    } else {
      setCreateNewGroup(false);
    }
  };
  return (
    <div className="tw-flex tw-items-center tw-h-[60px] tw-border-s-zinc-black tw-py-2 tw-px-0 tw-w-full tw-border-b tw-bg-gray-50">
      <div className="tw-h-[35px] tw-box-border tw-rounded-lg tw-mx-[16px] tw-flex-grow tw-flex tw-justify-between tw-text-[#54656f] ">
        <FilterDropDown />

        <div className="tw-bg-white tw-h-[35px] tw-box-border tw-border tw-rounded tw-px-2 tw-flex-grow tw-flex tw-justify-between tw-text-[#54656f]">
          <SearchBarButton search={chatSearch} setSearch={setChatSearch} />
          <input
            placeholder="Search or start new chat"
            className="tw-bg-white tw-placeholder-[#54656f] tw-text-sm tw-grow tw-outline-none"
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
          />
        </div>
      </div>
      <span
        onClick={handleCreateGroup}
        className="tw-mr-[16px] tw-cursor-pointer "
      >
        <HiUserGroup className="tw-h-[25px] tw-w-[25px]" />
      </span>
    </div>
  );
}

export default Index;
