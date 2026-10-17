import { Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { TbFilterBolt } from 'react-icons/tb';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';

const FilterDropDown = () => {
  const newCategories = ['All', 'Un Answered', 'Groups', 'Contacts'];
  const { selectedFilterCategory, setSelectedFilterCategory } = useAppContext();
  useEffect(() => {
    setSelectedFilterCategory(newCategories[0]);
  }, []);

  return (
    <Listbox
      value={selectedFilterCategory}
      onChange={setSelectedFilterCategory}
    >
      <div className="tw-relative tw-mr-2.5 tw-z-10">
        <Listbox.Button
          className="tw-relative tw-z-0 tw-cursor-default tw-rounded-lg tw-py-1 tw-pl-1 tw-pr-1
        tw-text-left tw-focus:outline-none tw-focus-visible:border-indigo-500 focus-visible:ring-2
        focus-visible:ring-white tw-focus-visible:ring-opacity-75 tw-focus-visible:ring-offset-2
        tw-focus-visible:ring-offset-[#00a884] sm:tw-text-sm focus:tw-outline-none tw-bg-gray-50"
        >
          <span className="tw-flex tw-items-center tw-cursor-pointer">
            <TbFilterBolt
              className={`tw-h-[25px] tw-w-[25px]  ${
                selectedFilterCategory !== 'All'
                  ? 'tw-text-green-600'
                  : 'tw-text-gray-600'
              }`}
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="tw-absolute tw-mt-1 tw-max-h-50 lg:tw-w-52 tw-pl-0 tw-overflow-auto tw-rounded-md tw-list-none tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-focus:outline-none sm:tw-text-sm tw-w-52 md:tw-w-52">
            {newCategories.map((category) => (
              <Listbox.Option
                key={category}
                className={({ active }) =>
                  `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-10 tw-pr-4 ${
                    active
                      ? 'tw-bg-[#e1fef2] tw-text-[#00a884]'
                      : 'tw-text-gray-900'
                  }`
                }
                value={category}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`tw-block truncate ${
                        selected
                          ? 'tw-font-medium tw-text-green-600'
                          : 'tw-font-normal'
                      }`}
                    >
                      {category}
                    </span>
                    {selected ? (
                      <span className="tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center tw-pl-3 tw-text-green-600">
                        <CheckIcon
                          className="tw-h-5 tw-w-5"
                          aria-hidden="true"
                        />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default FilterDropDown;
