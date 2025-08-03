import { Button } from "./Button";
import { RiMenu2Fill } from "react-icons/ri";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { IoClose, IoGlobeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";

export default function Navbar({ darkMode, setDarkMode }) {
  const { t } = useTranslation();
  const { isConnected, account, disconnectWallet, connectWallet, formatAddress, userRole } = useWeb3();
  const navigate = useNavigate();
  const isDesktop = window.innerWidth > 768;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  // Check if we're on a dashboard page
  const isDashboardPage = pathname.includes("/dashboard");

  window.onscroll = () => {
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    // Navigate to connect wallet page after disconnecting (root route)
    navigate("/");
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      // Navigate to main dashboard after successful connection
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const getRoleDisplay = () => {
    if (!userRole) return '';
    return userRole === 'landlord' ? 'Landlord' : 'Tenant';
  };

  return isDesktop ? (
    <div className="fixed top-0 left-0 right-0 z-10 w-full">
      <div className="flex items-center justify-between w-full px-20 py-2 bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800 transition-colors duration-300">
        <Link to="/about">
          <div className="cursor-pointer w-fit">
            <img src="/logo.png" alt="logo image" loading="lazy" className="w-[25rem] h-fit cursor-pointer" />
          </div>
        </Link>

        <div className="w-full">
          <ul className="flex items-center justify-center gap-16">
            <Link
              to="/about"
              className={`${
                pathname == "/about" ? "text-primary font-semibold" : ""
              } list-none text-[1.7rem] font-medium cursor-pointer hover:text-primary hover:font-bold w-fit h-fit transition-colors duration-200`}
              onClick={e => { e.preventDefault(); navigate('/about'); }}
            >
              {t("about")}
            </Link>

            <Link
              to="/dashboard"
              className={`${
                pathname == "/dashboard/landlord-dashboard" || pathname == "/dashboard/tenant-dashboard" ? "text-primary font-semibold" : ""
              } list-none text-[1.7rem] font-medium cursor-pointer hover:text-primary hover:font-bold w-fit h-fit transition-colors duration-200 text-nowrap`}
              onClick={e => { e.preventDefault(); navigate('/dashboard'); }}
            >
              {t("my dashboard")}
            </Link>
            <Link
              to="/contact"
              className={`${
                pathname == "/contact" ? "text-primary font-semibold" : ""
              } list-none text-[1.7rem] font-medium cursor-pointer hover:text-primary hover:font-bold w-fit h-fit transition-colors duration-200`}
              onClick={e => { e.preventDefault(); navigate('/contact'); }}
            >
              {t("contact")}
            </Link>
          </ul>
        </div>

        <div className="flex items-center w-fit gap-x-10">
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 text-xl font-medium mr-4 transition-colors duration-300"
            title="Toggle dark mode"
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
          <div className="flex items-center px-8 py-6 border cursor-pointer rounded-xl border-secondary gap-x-3">
            <IoGlobeOutline className="text-3xl" />
            <LanguageSelector />
          </div>
          {/* Show wallet address on dashboard pages, connect wallet on other pages */}
          {isDashboardPage && isConnected && account ? (
            <div className="flex items-center gap-x-4">
              <div className="flex flex-col items-end">
                <div className="px-4 py-2 text-[1.5rem] font-medium text-green-600 bg-green-100 rounded-lg">
                  {formatAddress(account)}
                </div>
                <div className="text-sm font-medium text-primary mt-1">
                  {getRoleDisplay()}
                </div>
              </div>
              <Button 
                name={t("disconnect")} 
                icon={<MdOutlineAccountBalanceWallet className="text-3xl" />} 
                onClick={handleDisconnect}
              />
            </div>
          ) : (
            <Button 
              name={t("connect wallet")} 
              icon={<MdOutlineAccountBalanceWallet className="text-3xl" />} 
              onClick={handleConnect}
            />
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="fixed top-0 left-0 right-0 z-10 w-full px-12 bg-white shadow-sm sm:px-20">
      <div className="flex items-center justify-between w-full dark:bg-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800">
        <Link to="/about">
          <div className="cursor-pointer w-fit">
            <img src="/logo.png" alt="logo image" loading="lazy" className="w-[25rem] h-fit cursor-pointer" />
          </div>
        </Link>

        <div className="flex w-full place-content-end">
          {!isOpen ? (
            <RiMenu2Fill className="text-6xl cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
          ) : (
            <IoClose className="text-6xl cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
          )}
        </div>
      </div>

      <div className={`w-full bg-white ${isOpen ? "opacity-100 translate-y-0 pb-14 block" : "opacity-0 -translate-y-8 hidden"}`}>
        <hr className="w-full h-px my-2 mb-8 bg-secondary" />

        <ul className="flex flex-col justify-start gap-16">
          <Link
            to="/about"
            className={`${
              pathname == "/about" ? "text-primary font-semibold" : ""
            } list-none text-[1.7rem] font-medium cursor-pointer hover:text-primary hover:font-bold w-fit h-fit transition-colors duration-200`}
            onClick={e => { e.preventDefault(); navigate('/about'); }}
          >
            {t("about")}
          </Link>
          <Link
            to="/dashboard"
            className={`${
              pathname == "/dashboard/landlord-dashboard" || pathname == "/dashboard/tenant-dashboard" ? "text-primary font-semibold" : ""
            } list-none text-[1.7rem] font-medium cursor-pointer hover:text-primary hover:font-bold w-fit h-fit transition-colors duration-200 text-nowrap`}
            onClick={e => { e.preventDefault(); navigate('/dashboard'); }}
          >
            {t("my dashboard")}
          </Link>
          <Link
            to="/contact"
            className={`${
              pathname == "/contact" ? "text-primary font-semibold" : ""
            } list-none text-[1.7rem] font-medium cursor-pointer hover:text-primary hover:font-bold w-fit h-fit transition-colors duration-200`}
            onClick={e => { e.preventDefault(); navigate('/contact'); }}
          >
            {t("contact")}
          </Link>
        </ul>

        <hr className="w-full h-px mt-16 bg-secondary mb-7" />
        <div className="flex flex-col w-full md:w-fit gap-y-10">
          <div className="flex items-center px-8 py-6 border cursor-pointer rounded-xl w-fit border-secondary gap-x-3">
            <IoGlobeOutline className="text-3xl" />
            <LanguageSelector />
          </div>
          {/* Show wallet address on dashboard pages, connect wallet on other pages */}
          {isDashboardPage && isConnected && account ? (
            <div className="flex flex-col gap-y-4">
              <div className="text-center">
                <div className="px-4 py-2 text-[1.5rem] font-medium text-green-600 bg-green-100 rounded-lg">
                  {formatAddress(account)}
                </div>
                <div className="text-sm font-medium text-primary mt-2">
                  {getRoleDisplay()}
                </div>
              </div>
              <Button
                name={t("disconnect")}
                className="w-full flex items-center justify-center md:w-fit h-[5rem]"
                icon={<MdOutlineAccountBalanceWallet className="text-3xl" />}
                onClick={handleDisconnect}
              />
            </div>
          ) : (
            <Button
              name={t("connect wallet")}
              className="w-full flex items-center justify-center md:w-fit h-[5rem]"
              icon={<MdOutlineAccountBalanceWallet className="text-3xl" />}
              onClick={handleConnect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
