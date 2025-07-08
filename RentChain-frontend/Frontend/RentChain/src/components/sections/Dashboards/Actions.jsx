import QuickAction from "../../ui/QuickAction";
import RecentActivities from "../../ui/RecentActivities";

export default function Actions() {
  return (
    <div className="flex flex-wrap items-start justify-between w-full gap-16 mt-10 md:flex-nowrap section-page">
      <div className="md:flex-[4] w-full">
        <RecentActivities />
      </div>
      <div className="w-full md:flex-[2]">
        <QuickAction />
      </div>
    </div>
  );
}
