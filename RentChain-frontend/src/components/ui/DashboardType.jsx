import { HiOfficeBuilding, HiOutlineUserCircle } from "react-icons/hi";
import { IoArrowBackSharp, IoHomeOutline, IoPeople } from "react-icons/io5";
import { GrVmMaintenance } from "react-icons/gr";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlinePayments } from "react-icons/md";
import { FaRegBuilding } from "react-icons/fa";
import { useWeb3 } from "../../hooks/useWeb3";
import { useTranslation } from "react-i18next";

export default function DashboardType() {
  const navigate = useNavigate();
  const { account, registerWallet, isConnected } = useWeb3();
  const { t } = useTranslation();

  const handleRoleSelection = (role) => {
    if (isConnected && account) {
      registerWallet(account, role);
      navigate(`/dashboard/${role}-dashboard`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen section-page bg-gradient-to-br from-blue-50 to-green-50">
      <div
        onClick={() => navigate(-1)}
        className="absolute flex items-center cursor-pointer gap-x-6 top-10 left-10 hover:scale-95 hover:text-primary"
      >
        <IoArrowBackSharp className="text-4xl" />
        <span className="text-3xl font-medium">{t("back") || "Back"}</span>
      </div>

      <div className="w-full px-6 py-12 mx-auto">
        <div className="space-y-4 text-center">
          <h3 className="text-5xl font-bold text-gray-800">{t("welcome_rentchain") || "Welcome to RentChain"}</h3>
          <p className="text-3xl normal-case text-secondary">{t("choose_role_dashboard") || "Choose your role to access the appropriate dashboard"}</p>
          {isConnected && account && (
            <p className="text-xl text-gray-600">
              {t("connected_wallet") || "Connected wallet"}: <span className="font-mono text-primary">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </p>
          )}
        </div>

        <div className="grid w-[80%] m-auto grid-cols-1 gap-8 mt-12 md:grid-cols-2">
          {/* Landlord Option */}
          <div onClick={() => handleRoleSelection('landlord')}>
            <div className="p-6 bg-white border border-gray-200 cursor-pointer group rounded-xl hover:shadow-xl hover:scale-95">
              <div className="flex flex-col p-10 space-y-6 text-center">
                <HiOfficeBuilding className="p-3 m-auto text-white rounded-full textcent text-8xl bg-primary" />
                <h4 className="text-5xl font-semibold normal-case text-primary">{t("i_am_landlord") || "I am a Landlord"}</h4>
                <p className="text-3xl font-medium normal-case text-secondary">{t("manage_properties_tenants") || "Manage properties, tenants, and rental income"}</p>
                <ul className="flex flex-col items-start space-y-4 text-2xl text-left text-gray-600">
                  <li className="flex items-center list-none gap-x-4">
                    <IoHomeOutline className="text-4xl text-primary" />
                    {t("manage_multiple_properties") || "Manage multiple properties"}
                  </li>
                  <li className="flex items-center list-none gap-x-4">
                    <IoPeople className="text-4xl text-primary" />
                    {t("track_tenant_info") || "Track tenant information"}
                  </li>
                  <li className="flex items-center list-none gap-x-4">
                    <GrVmMaintenance className="text-4xl text-primary" />
                    {t("handle_maintenance") || "Handle maintenance requests"}
                  </li>
                </ul>
                <button className="px-6 py-4 text-[1.7rem] !mt-10 font-medium w-full h-[5.5rem] text-white rounded-xl bg-primary hover:opacity-90">
                  {t("continue_as_landlord") || "Continue as Landlord"}
                </button>
              </div>
            </div>
          </div>

          {/* Tenant Option */}
          <div onClick={() => handleRoleSelection('tenant')}>
            <div className="p-6 bg-white border border-gray-200 cursor-pointer group rounded-xl hover:shadow-xl hover:scale-95">
              <div className="flex flex-col p-10 space-y-6 text-center">
                <IoHomeOutline className="p-3 m-auto text-white bg-green-500 rounded-full textcent text-8xl" />
                <h4 className="text-5xl font-semibold text-green-500 normal-case">{t("i_am_tenant") || "I am a tenant"}</h4>
                <p className="text-3xl font-medium normal-case text-secondary">{t("pay_rent_submit_requests") || "Pay rent, submit requests, and manage your lease"}</p>
                <ul className="flex flex-col items-start space-y-4 text-2xl text-left text-gray-600">
                  <li className="flex items-center list-none gap-x-4">
                    <MdOutlinePayments className="text-4xl text-green-500" />
                    {t("pay_rent_securely") || "Pay rent securely"}
                  </li>
                  <li className="flex items-center list-none gap-x-4">
                    <FaRegBuilding className="text-4xl text-green-500" />
                    {t("submit_maintenance") || "Submit maintenance requests"}
                  </li>
                  <li className="flex items-center list-none gap-x-4">
                    <IoPeople className="text-4xl text-green-500" />
                    {t("communicate_landlord") || "Communicate with landlord"}
                  </li>
                </ul>
                <button className="px-6 py-4 text-[1.7rem] !mt-10 font-medium w-full h-[5.5rem] text-white rounded-xl bg-green-500 hover:opacity-90">
                  {t("continue_as_tenant") || "Continue as tenant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
