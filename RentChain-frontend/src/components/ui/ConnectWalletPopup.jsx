import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";

export default function ConnectWalletPopup() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const closePopup = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
        <div className="absolute top-10 right-10 w-fit">
          <IoClose
            className="p-2 text-[4rem] hover:text-primary hover:scale-95 cursor-pointer bg-white rounded-full text-secondary"
            onClick={closePopup}
          />
        </div>
        <div className="w-full max-w-3xl m-auto">
          <div className="w-full p-8 bg-white shadow-xl rounded-xl">
            <h2 className="mb-4 text-4xl font-bold text-center">Connect Wallet</h2>
            <p className="mb-6 text-[1.7rem] font-medium normal-case text-center">Please connect your wallet to continue.</p>
            <button
              className="w-full h-[5.5rem] capitalize text-[1.7rem] font-semibold text-white bg-primary rounded-xl hover:bg-blue-600 transition-colors duration-200"
              onClick={() => {
                alert("Wallet connected!");
                closePopup();
              }}
            >
              {t("connect wallet")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
