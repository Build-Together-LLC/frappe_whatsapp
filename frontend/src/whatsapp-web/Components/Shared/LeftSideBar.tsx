import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useGetActiveSession from '@/whatsapp-web/personal-whatsapp/Query/useGetActiveSession';
import { FaWhatsapp } from 'react-icons/fa';
import { FiPlusCircle } from 'react-icons/fi';

export interface LeftSidebarProps {
  setIsSessionCreatePopup: (isCreate: boolean) => void;
  isSessionCreatePopup: boolean;
}

export default function LeftSidebar({
  setIsSessionCreatePopup,
  isSessionCreatePopup,
}: LeftSidebarProps) {
  const { data: activeSession } = useGetActiveSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionArray, setSessionArray] = useState<any[]>([]);

  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const whatsappSessions = activeSession?.message?.length
      ? activeSession.message.map((session: any) => ({
          label: session.session_id,
          value: session.name,
          icon: <FaWhatsapp className="tw-h-5 tw-w-5 tw-text-green-500" />,
          tab: 'whatsapp',
        }))
      : [];

    const sessionItems = [
      ...whatsappSessions,
      {
        label: 'Add New Personal Whatsapp Session',
        icon: <FiPlusCircle className="tw-h-5 tw-w-5 tw-text-green-500" />,
        value: 'addNewSession',
        tab: 'whatsapp',
      },
    ];

    setSessionArray(sessionItems);
  }, [activeSession]);
  const handleChange = (item: any) => {
    if (item.value === 'addNewSession') {
      setIsSessionCreatePopup(!isSessionCreatePopup);
    } else {
      searchParams.set('tab', 'whatsapp');
      searchParams.set('session', item.value);
      searchParams.delete('contact');
      searchParams.delete('group');
      setSearchParams(searchParams);
    }
  };

  return (
    <>
      <div
        className="tw-w-18 tw-bg-gray-100 tw-border-r tw-transition-all tw-duration-300 tw-relative tw-overflow-y-auto tw-overflow-x-hidden"
        style={{
          height: '100dvh',
        }}
      >
        <div className="tw-flex tw-flex-col tw-mt-4">
          {sessionArray.map((item, idx) => (
            <div
              className="tw-relative tw-cursor-pointer"
              key={idx}
              onClick={() => handleChange(item)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPos({
                  top: rect.top + rect.height / 2,
                  left: rect.right + 8,
                });
                setHoveredLabel(item.label);
              }}
              onMouseLeave={() => setHoveredLabel(null)}
            >
              <div className="tw-flex tw-items-center tw-justify-center tw-p-3 hover:tw-bg-gray-200 tw-transition-colors">
                <div className="tw-text-gray-600 tw-text-xl">{item.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip (rendered outside scroll area) */}
      {hoveredLabel && (
        <div
          className="tw-fixed tw-bg-white tw-border tw-shadow-md tw-rounded-md tw-text-sm tw-px-2 tw-py-1 tw-z-50"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {hoveredLabel}
        </div>
      )}
    </>
  );
}
