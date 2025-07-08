import DashboardLayout from "../layouts/DashboardLayout";
import RoleGuard from "../components/common/RoleGuard";

export default function LandLordDashboard() {
  return (
    <RoleGuard requiredRole="landlord">
      <div>
        <DashboardLayout />
      </div>
    </RoleGuard>
  );
}
