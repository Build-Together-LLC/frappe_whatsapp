import useGetUserList from '@/whatsapp-web/personal-whatsapp/Query/useGetUserList';
import { useEffect, useRef, useState } from 'react';
import useAssignUserToContact from '@/whatsapp-web/personal-whatsapp/Query/useAssignUserToContact';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';
import Loader from '@/shared/Loader';
import {
  colors,
  UserColorMap,
} from '@/whatsapp-web/personal-whatsapp/Right/ChatHeader/AssigneUsers/AssignedUser';

const AssignToUser = () => {
  const [selected, setSelected] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [usersWithColors, setUsersWithColors] = useState<UserColorMap>({});
  const [isFocused, setIsFocused] = useState(false);
  const [debounceQuery, setDebounceQuery] = useState('');
  const { isLoading, error, data } = useGetUserList(debounceQuery);
  const { mutateAsync } = useAssignUserToContact();
  const { selectedUserDetail } = useAppContext();
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebounceQuery(query);
    }, 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, [query]);
  const filteredPeople = Array.isArray(data?.results || data?.message)
    ? query === ''
      ? data.results || data.message
      : (data.results || data.message).filter((user: any) =>
          user.description
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )
    : [];
  const refinedFilteredPeople = filteredPeople.filter(
    (user: any) =>
      Array.isArray(selectedUserDetail) &&
      !selectedUserDetail.some(
        (detail: any) => detail.user_assign === user.value
      )
  );
  const handleFocus = () => {
    setSelected(true);
  };
  const handleAssignUser = (selectedIndex: number) => {
    mutateAsync(refinedFilteredPeople[selectedIndex].value);
    (document.activeElement as HTMLElement)?.blur();
    setSelected(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selected) return;

    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) =>
        prev === null || prev === refinedFilteredPeople.length - 1
          ? 0
          : prev + 1
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) =>
        prev === null || prev === 0
          ? refinedFilteredPeople.length - 1
          : prev - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex !== null) {
        handleAssignUser(highlightedIndex);
      }
    }
  };
  useEffect(() => {
    if (highlightedIndex !== null && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionRef.current &&
        !optionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setSelected(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleFocus = () => {
    if (isFocused) {
      inputRef?.current?.blur();
      setSelected(false);
    } else {
      inputRef?.current?.focus();
    }
    setIsFocused(!isFocused);
  };

  if (error) return <>An error has occurred </>;

  return (
    <div className={'tw-max-h-350px'}>
      <div onKeyDown={handleKeyDown}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          className="tw-w-full tw-py-2 tw-pl-3 tw-pr-10 tw-rounded-lg tw-bg-white tw-shadow-md tw-focus:outline-none tw-focus-visible:border-indigo-500 tw-focus-visible:ring-2 tw-focus-visible:ring-white tw-focus-visible:ring-opacity-75 tw-focus-visible:ring-offset-2 tw-focus-visible:ring-offset-[#00a884] sm:tw-text-sm tw-border-2"
          placeholder="Search User To Assign..."
          ref={inputRef}
          onClick={handleToggleFocus}
        />
        <div
          className={`${selected ? '' : 'tw-hidden'} tw-relative tw-w-full`}
          ref={optionRef}
        >
          <div
            className={`tw-max-h-[200px] tw-absolute tw-top-full tw-z-20 tw-flex tw-flex-col tw-w-full tw-mt-1 tw-rounded-md tw-bg-white tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-outline-none sm:tw-text-sm tw-overflow-auto`}
          >
            {refinedFilteredPeople.length === 0 ? (
              <span
                className={`tw-cursor-default tw-select-none tw-pl-10 tw-pr-4 `}
              >
                no user to assign
              </span>
            ) : null}
            {isLoading ? (
              <Loader />
            ) : (
              refinedFilteredPeople.map((user: any, index: number) => {
                if (!usersWithColors[user.value]) {
                  usersWithColors[user.value] = Math.floor(
                    Math.random() * colors.length
                  );
                  setUsersWithColors({ ...usersWithColors });
                }
                return (
                  <div
                    className={`tw-group `}
                    key={index}
                    onClick={() => handleAssignUser(index)}
                    ref={(el) => (itemRefs.current[index] = el)}
                  >
                    <div
                      className={`tw-flex tw-justify-between tw-cursor-pointer tw-items-center tw-w-full tw-bg-gray-50 tw-px-3 tw-py-2 tw-rounded-md md:group-hover:tw-bg-green-200 tw-shadow-sm ${
                        index === highlightedIndex
                          ? 'tw-bg-green-200 tw-text-gray-900'
                          : user.active
                            ? 'tw-bg-[#e1fef2] tw-text-[#00a884]'
                            : 'tw-text-gray-900'
                      }`}
                    >
                      <div
                        className={`${colors[usersWithColors[user.value]]?.text} tw-h-[40px] tw-w-[40px] tw-rounded-full tw-flex tw-shadow-md tw-items-center tw-justify-center ${colors[usersWithColors[user.value]]?.color} tw-opacity-[.80]`}
                      >
                        {user.description
                          .split(' ')
                          .slice(0, 2)
                          .map((word: string): string => word[0])}
                      </div>
                      <div
                        className={'tw-flex tw-flex-col tw-pl-3 tw-flex-grow'}
                      >
                        <span
                          className={
                            'tw-font-semibold tw-text-gray-800 tw-text-sm'
                          }
                        >
                          {user.description}
                        </span>
                        <span className={'tw-text-xs tw-text-gray-500'}>
                          {user.value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AssignToUser;
