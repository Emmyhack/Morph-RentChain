import DashboardLayout from "../layouts/DashboardLayout";
import RoleGuard from "../components/common/RoleGuard";

export default function TenantDashboard() {
  return (
    <RoleGuard requiredRole="tenant">
      <div>
        <DashboardLayout />
      </div>
    </RoleGuard>
  );
}
