import { IoWalletOutline } from "react-icons/io5";
import { Button } from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../hooks/useWeb3";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ConnectWallet() {
  const navigate = useNavigate();
  const { connectWallet, isConnected, account, isConnecting, formatAddress, userRole } = useWeb3();
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleConnectMetaMask = async () => {
    try {
      setError("");
      const result = await connectWallet();
      // After connecting, go to about page first
      navigate("/about");
    } catch (error) {
      setError(t("connect_wallet_error"));
      console.error("Connection error:", error);
    }
  };

  // If already connected, show connected state
  if (isConnected && account) {
    const roleDisplay = userRole === 'landlord' ? t('landlord') : t('tenant');
    
    return (
      <div className="flex items-center justify-center w-full h-screen max-h-screen bg-gray-50">
        <div className="flex flex-col items-center w-full">
          <div className="mb-5 cursor-pointer w-fit">
            <img src="/logo.png" alt="logo image" loading="lazy" className="w-[20rem] h-fit cursor-pointer" />
          </div>
          <h3 className="text-5xl font-semibold normal-case pb-7 text-secondary">{t("decentralized_rental_platform")}</h3>
          <p className="text-[1.7rem] font-medium normal-case text-secondary">{t("wallet_connected")}</p>
          <div className="flex flex-col items-center justify-center w-full max-w-5xl px-10 py-10 mt-8 bg-white shadow-sm rounded-xl">
            <div className="flex items-center mb-5 gap-x-5">
              <IoWalletOutline className="text-6xl text-green-500" />
              <h2 className="text-4xl font-semibold text-green-600">{t("connected")}</h2>
            </div>
            <div className="mb-6 text-center">
              <p className="text-2xl font-medium text-gray-700 mb-2">{t("wallet_address")}</p>
              <p className="text-xl font-mono bg-gray-100 px-4 py-2 rounded-lg mb-4">{formatAddress(account)}</p>
              <p className="text-lg font-medium text-primary">{t("role_display", { role: roleDisplay })}</p>
            </div>
            <Button 
              onClick={() => navigate("/about")} 
              className="flex justify-center w-full text-center" 
              name={t("go_to_about_page")} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-screen max-h-screen bg-gray-50">
      <div className="flex flex-col items-center w-full">
        <div className="mb-5 cursor-pointer w-fit">
          <img src="/logo.png" alt="logo image" loading="lazy" className="w-[20rem] h-fit cursor-pointer" />
        </div>
        <h3 className="text-5xl font-semibold normal-case pb-7 text-secondary">{t("decentralized_rental_platform")}</h3>
        <p className="text-[1.7rem] font-medium normal-case text-secondary">{t("connect_wallet_prompt")}</p>
        <div className="flex flex-col items-center justify-center w-full max-w-5xl px-10 py-10 mt-8 bg-white shadow-sm rounded-xl">
          <div className="flex items-center mb-5 gap-x-5">
            <IoWalletOutline className="text-6xl text-primary" />
            <h2 className="text-4xl font-semibold">{t("connect_wallet")}</h2>
          </div>
          <div className="flex flex-col w-full gap-y-5">
            <Button 
              onClick={handleConnectMetaMask} 
              className="flex justify-center w-full text-center" 
              name={isConnecting ? t("connecting") : t("connect_metamask")} 
              disabled={isConnecting}
            />
            {error && (
              <div className="text-red-500 text-center text-lg font-medium">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
