import { useLocation } from "react-router-dom";
import User from "../../ui/User";
import { useTranslation } from "react-i18next";

export default function DashboardHeader() {
  const location = useLocation();
  const pathName = location.pathname;
  const { t } = useTranslation();

  return (
    <div className="w-full section-page">
      <div className="flex flex-wrap items-center justify-between gap-10 mt-10 md:mt-0">
        {pathName == "/dashboard/landlord-dashboard" ? (
          <div className="space-y-4">
            <h2 className="text-5xl font-semibold">{t("lanlord dashboard")}</h2>
            <p className="text-3xl font-medium normal-case text-secondary">{t("Ldashboard")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-5xl font-semibold">{t("tenant dashboard")}</h2>
            <p className="text-3xl font-medium normal-case text-secondary"> {t("Tdashboard")} </p>
          </div>
        )}
        <div className="">
          <User />
        </div>
      </div>
    </div>
  );
}
