import useInfiniteMessageQuery from '../../../Query/useInfiniteMessageQuery';
import { useInView } from 'react-intersection-observer';
import { useEffect, useRef, useState } from 'react';
import ChatMessageComponent from './ChatMessageComponent';

interface UserColorMap {
  [userId: string]: string;
}

const Index = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [userColorMap, setUserColorMap] = useState<UserColorMap>({});
  const { ref, inView } = useInView();

  const divref = useRef<HTMLDivElement>(null);
  const { isFetchingNextPage, fetchNextPage, hasNextPage, error, data } =
    useInfiniteMessageQuery(isIntersecting);
  const allMessages = data?.pages[0]?.message || [];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === divref.current) {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
          } else {
            setIsIntersecting(false);
          }
        }
      });
    });

    if (divref.current) {
      observer.observe(divref.current);
    }

    return () => {
      if (divref.current) {
        observer.unobserve(divref.current);
      }
    };
  }, [divref.current]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().then(() => {});
    }
  }, [inView, hasNextPage]);

  function getRandomColor() {
    let red, green, blue;
    let brightness;

    do {
      red = Math.floor(Math.random() * 128) + 50;
      green = Math.floor(Math.random() * 128) + 50;
      blue = Math.floor(Math.random() * 128) + 50;

      brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
    } while (brightness > 120);

    const randomColor = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
    return randomColor;
  }

  if (error) return <>An error has occurred:{error} </>;
  let previousMessageDate = null;
  return (
    <div
      ref={divref}
      className={
        'tw-h-full tw-overflow-y-auto tw-flex tw-flex-col-reverse tw-bg-[#efeae2]'
      }
    >
      {allMessages.map((msg: any, index: any) => {
        if (!userColorMap[msg.user_id]) {
          userColorMap[msg.user_id] = getRandomColor();
          setUserColorMap({ ...userColorMap });
        }

        const creationDate = new Date(
          window?.frappe?.datetime.convert_to_user_tz(msg.creation) ||
            msg.creation
        );

        const formattedDate = creationDate.toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });

        // Getting today's date
        const today = new Date();
        const formattedToday = today.toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const formattedYesterday = yesterday.toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });

        let displayDate;
        if (formattedDate === formattedToday) {
          displayDate = 'Today';
        } else if (formattedDate === formattedYesterday) {
          displayDate = 'Yesterday';
        } else {
          displayDate = formattedDate;
        }
        const previousMsg = allMessages[index + 1];
        previousMessageDate = previousMsg
          ? new Date(
              window?.frappe?.datetime.convert_to_user_tz(
                previousMsg.creation
              ) || previousMsg.creation
            ).toLocaleDateString('en-US', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })
          : null;
        const showDate = formattedDate !== previousMessageDate;
        const showSenderName =
          msg.type !== 'Outgoing' &&
          (!previousMsg ||
            previousMsg.user_id !== msg.user_id ||
            previousMsg.type === 'Outgoing' ||
            showDate);
        return (
          <div key={index}>
            {showDate && (
              <div className={`tw-flex  tw-justify-center tw-items-center`}>
                <span className="tw-text-[12px] tw-px-2 tw-bg-white tw-rounded tw-my-2">
                  {displayDate}
                </span>
              </div>
            )}
            <ChatMessageComponent
              msg={msg}
              userColorMap={userColorMap}
              allmsg={allMessages}
              upView={index <= 4 ? true : false}
              showSenderName={showSenderName}
            />
          </div>
        );
      })}
      <button
        ref={ref}
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
            ? 'Load Older'
            : 'Nothing more to load'}
      </button>
    </div>
  );
};
export default Index;
