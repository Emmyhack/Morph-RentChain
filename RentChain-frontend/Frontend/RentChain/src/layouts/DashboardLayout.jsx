import Actions from "../components/sections/Dashboards/Actions";
import DashboardHeader from "../components/sections/Dashboards/DashboardHeader";
import DashboardNavigation from "../components/sections/Dashboards/DashboardNavigation";
import DashboardShowCase from "../components/sections/Dashboards/DashboardShowCase";

export default function DashboardLayout() {
  return (
    <div className="w-full h-full bg-gray-50 py-52">
      <DashboardHeader />
      <DashboardNavigation />
      <DashboardShowCase />
      <Actions />
    </div>
  );
}
