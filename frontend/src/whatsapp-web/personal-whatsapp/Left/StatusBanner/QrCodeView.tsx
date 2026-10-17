import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAppContext } from '@/whatsapp-web/personal-whatsapp/Context/AppContext';

const QrCodeView = () => {
  const { isViewQrCode, setIsViewQrCode, selectedSessionDetail } =
    useAppContext();
  return (
    <>
      <Transition appear show={isViewQrCode} as={Fragment}>
        <Dialog
          as="div"
          className="tw-relative tw-z-[1000] "
          onClose={() => setIsViewQrCode(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-25" />
          </Transition.Child>
          <div className="tw-fixed tw-inset-0 tw-overflow-y-auto">
            <div className="tw-flex tw-min-h-full tw-items-center tw-justify-center tw-p-4 tw-text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`tw-w-full tw-px-2 tw-py-3 tw-max-w-[500px] tw-max-h-[600px]   tw-transform tw-rounded-2xl tw-bg-white tw-text-left tw-align-middle tw-shadow-xl tw-transition-all`}
                >
                  <div className={'tw-text-center tw-mb-2'}>
                    Scan This QR In Your Whatsapp App
                  </div>
                  <div className={'tw-p-1 tw-border-2 tw-border-gray-400 '}>
                    <img
                      src={`/api/method/frappe_whatsapp.personal_whatsapp.doctype.whatsapp_session.whatsapp_session.get_qr_code?url=${selectedSessionDetail.qr_image_link}`}
                      className={'tw-w-full tw-h-full'}
                      alt="Qr Code"
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
export default QrCodeView;
