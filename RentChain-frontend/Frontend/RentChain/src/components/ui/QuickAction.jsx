import { CiStar, CiWallet } from "react-icons/ci";
import { FaDollarSign } from "react-icons/fa";
import { GoPeople, GoTools } from "react-icons/go";
import { IoAdd, IoChatboxOutline, IoHomeOutline, IoWarningOutline } from "react-icons/io5";
import { LuNotebook } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function QuickAction() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-10">
      <div className="w-full p-12 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7 dark:bg-gray-900 dark:text-white dark:border-gray-700">
        <span className="text-5xl font-semibold dark:text-white">{t('quickActions.title')}</span>

        {pathname == "/dashboard/landlord-dashboard" ? (
          <div className="w-full !mt-16 space-y-8">
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/landlord-dashboard/add-property')}>
              <IoAdd className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.addNewProperty')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/landlord-dashboard/my-properties')}>
              <IoHomeOutline className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.viewAllProperties')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/landlord-dashboard/payments')}>
              <FaDollarSign className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.paymentHistory')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/landlord-dashboard/tenants')}>
              <GoPeople className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.tenantManagement')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/landlord-dashboard/maintenance')}>
              <IoWarningOutline className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.maintenanceRequests')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/landlord-dashboard/reports')}>
              <LuNotebook className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.generateReports')}</span>
            </div>
          </div>
        ) : (
          <div className="w-full !mt-16 space-y-8">
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/tenant-dashboard/payment')}>
              <CiWallet className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.payRent')}</span>
            </div>
            <div className="flex flex-col">
              <div
                className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl relative group dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                onClick={() => navigate('/dashboard/tenant-dashboard/complaints')}
                title={t('quickActions.complaintTooltip')}
              >
                <GoTools className="text-4xl dark:text-white" />
                <span className="text-3xl font-medium dark:text-white">{t('quickActions.submitMaintenanceRequest')}</span>
                <span className="absolute top-2 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full group-hover:bg-primary-dark transition">{t('quickActions.new')}</span>
              </div>
              <span className="text-lg text-gray-500 mt-2 ml-2 dark:text-gray-300">{t('quickActions.complaintDescription')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/tenant-dashboard/lease')}>
              <IoHomeOutline className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.viewLeaseAgreement')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/tenant-dashboard/chat')}>
              <IoChatboxOutline className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.contactLandlord')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/tenant-dashboard/payments')}>
              <FaDollarSign className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.paymentHistory')}</span>
            </div>
            <div className="flex items-center w-full border border-gray-200 cursor-pointer hover:scale-95 gap-x-10 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => navigate('/dashboard/tenant-dashboard/credit-score')}>
              <CiStar className="text-4xl dark:text-white" />
              <span className="text-3xl font-medium dark:text-white">{t('quickActions.checkCreditScore')}</span>
            </div>
          </div>
        )}
      </div>
      {pathname !== "/dashboard/landlord-dashboard" && (
        <div className="w-full p-12 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7 dark:bg-gray-900 dark:text-white dark:border-gray-700">
          <span className="text-5xl font-semibold dark:text-white">{t('quickActions.upcomingPayments')}</span>
          <div className="w-full !mt-16 space-y-8">
            <div className="flex items-center justify-between w-full border border-gray-200 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <div className="space-y-4">
                <p className="text-[1.7rem] font-normal text-secondary normal-case dark:text-gray-300">{t('quickActions.monthlyRent', { month: 'July 2024' })}</p>
                <h4 className="text-4xl font-medium dark:text-white">$1,200</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center px-5 py-2 text-2xl font-semibold text-center text-white bg-gray-300 rounded-full dark:bg-gray-700">{t('quickActions.upcoming')}</div>
                <p className="text-3xl font-normal normal-case text-secondary dark:text-gray-300">{t('quickActions.dueDate', { date: 'July 15, 2024' })}</p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full border border-gray-200 p-7 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <div className="space-y-4">
                <p className="text-[1.7rem] font-normal text-secondary normal-case dark:text-gray-300">{t('quickActions.utilities', { month: 'June 2024' })}</p>
                <h4 className="text-4xl font-medium dark:text-white">$85</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center px-5 py-2 text-2xl font-semibold text-center text-white bg-red-500 rounded-full dark:bg-red-700">{t('quickActions.overdue')}</div>
                <p className="text-3xl font-normal normal-case text-secondary dark:text-gray-300">{t('quickActions.dueDate', { date: 'July 10, 2024' })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
