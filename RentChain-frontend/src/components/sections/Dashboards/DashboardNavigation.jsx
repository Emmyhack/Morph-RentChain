import { FaMoneyBill } from "react-icons/fa";
import { IoChatbubbleOutline, IoHomeOutline, IoWarningOutline } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";

export default function DashboardNavigation() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div>
      <div className="w-full !py-20 section-page">
        {pathname == "/dashboard/landlord-dashboard" ? (
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
            <Link to="/dashboard/landlord-dashboard/my-properties">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <IoHomeOutline className="w-20 h-20 p-2 bg-gray-50 rounded-xl text-primary" />
                <h3 className="text-4xl font-semibold ">my properties</h3>
              </div>
            </Link>
            <Link to="/dashboard/landlord-dashboard/payments">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <FaMoneyBill className="w-20 h-20 p-2 text-green-500 bg-gray-50 rounded-xl" />
                <h3 className="text-4xl font-semibold "> payments</h3>
              </div>
            </Link>
            <Link to="/dashboard/landlord-dashboard/complaints">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <IoWarningOutline className="w-20 h-20 p-2 text-red-500 bg-gray-50 rounded-xl" />
                <h3 className="text-4xl font-semibold "> complaints</h3>
              </div>
            </Link>
            <Link to="/dashboard/landlord-dashboard/chat">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <IoChatbubbleOutline className="w-20 h-20 p-2 text-purple-500 bg-gray-50 rounded-xl" />
                <h3 className="text-4xl font-semibold ">chats </h3>
              </div>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
            <Link to="/dashboard/tenant-dashboard/properties">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <IoHomeOutline className="w-20 h-20 p-2 bg-gray-50 rounded-xl text-primary" />
                <h3 className="text-4xl font-semibold ">browse properties</h3>
              </div>
            </Link>
            <Link to="/dashboard/tenant-dashboard/payment">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <FaMoneyBill className="w-20 h-20 p-2 text-green-500 bg-gray-50 rounded-xl" />
                <h3 className="text-4xl font-semibold ">pay rent</h3>
              </div>
            </Link>
            <Link to="/dashboard/tenant-dashboard/complaints">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <IoWarningOutline className="w-20 h-20 p-2 text-red-500 bg-gray-50 rounded-xl" />
                <h3 className="text-4xl font-semibold ">file complaint</h3>
              </div>
            </Link>
            <Link to="/dashboard/tenant-dashboard/chat">
              <div className="flex items-center w-full p-8 bg-white border shadow-sm cursor-pointer border-gray-50 md:flex-1 hover:scale-95 gap-x-8 rounded-xl">
                <IoChatbubbleOutline className="w-20 h-20 p-2 text-purple-500 bg-gray-50 rounded-xl" />
                <h3 className="text-4xl font-semibold ">chats </h3>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
