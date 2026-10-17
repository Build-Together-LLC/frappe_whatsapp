// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { ReactComponent as BackArrow } from '../../../assets/raw_icons/CloseArrow.svg';
import { SearchIcon } from '../../../assets/icons';

const SearchBarButton = ({
  search,
  setSearch,
}: {
  search: string;
  // eslint-disable-next-line no-shadow
  setSearch: (search: string) => void;
}) => {
  return (
    <button className="tw-flex tw-justify-center tw-items-center tw-mr-2 tw-bg-white">
      {search !== '' ? (
        <span
          onClick={() => setSearch('')}
          className=" tw-text-[#54656f] focus:tw-outline-none"
        >
          <BackArrow />
        </span>
      ) : (
        <SearchIcon />
      )}
    </button>
  );
};

export default SearchBarButton;
