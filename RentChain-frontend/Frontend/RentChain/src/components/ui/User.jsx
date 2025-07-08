import { CiWallet } from "react-icons/ci";
import { Button } from "../common/Button";
import { IoAdd, IoNotifications } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

export default function User() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  return pathname != "/dashboard/landlord-dashboard" ? (
    <div className="flex items-center w-full gap-x-10">
      <Button name="pay rent" icon={<CiWallet className="text-4xl" />} onClick={() => navigate('/dashboard/tenant-dashboard/payment')} />
      <div className="flex items-center px-8 py-6 text-3xl font-medium border cursor-pointer hover:scale-95 border-secondary rounded-xl gap-x-6">
        <IoNotifications className="text-4xl" />
        notifications
      </div>
    </div>
  ) : (
    <div className="flex items-center w-full gap-x-10">
      <Button name="add property" icon={<IoAdd className="text-4xl" />} onClick={() => navigate('/dashboard/landlord-dashboard/add-property')} />
      <div className="flex items-center px-8 py-6 text-3xl font-medium border cursor-pointer hover:scale-95 border-secondary rounded-xl gap-x-6">
        <IoNotifications className="text-4xl" />
        notifications
      </div>
    </div>
  );
}
