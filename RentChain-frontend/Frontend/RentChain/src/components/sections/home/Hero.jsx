import { FaSearch } from "react-icons/fa";
import { ButtonTwo } from "../../common/Button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full h-full section" style={{
      background: 'linear-gradient(120deg, #6366f1 0%, #a5b4fc 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(30, 41, 59, 0.55)',
        zIndex: 1,
      }} />
      <div className="section-page mt-28" style={{ position: 'relative', zIndex: 2 }}>
        <div className="md:w-[65%] text-center m-auto text-white">
          <h1 className="md:text-[7rem] text-8xl leading-none font-bold ">
            {t("hero.title")} <span className="text-yellow-500">RentChain</span>
          </h1>
          <p className="py-8 text-4xl font-normal normal-case md:text-5xl">{t("hero.description")}</p>

          <div className="flex flex-wrap items-center justify-center w-full gap-10 m-auto mt-10 gap-x-7 sm:w-fit sm:flex-nowrap">
            <ButtonTwo
              name={t("search for property")}
              className="flex items-center justify-center w-full cursor-pointer md:w-fit"
              icon={<FaSearch className="text-3xl" />}
              onClick={() => navigate('/dashboard/tenant-dashboard/properties')}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-16 mt-20 sm:flex-nowrap">
            <div className="w-full space-y-1">
              <h3 className="text-6xl font-bold text-yellow-500">1,000+</h3>
              <p className="text-3xl font-medium">{t("hero.listed")}</p>
            </div>

            <div className="w-full space-y-1">
              <h3 className="text-6xl font-bold text-yellow-500">500+</h3>
              <p className="text-3xl font-medium">{t("hero.tenants")}</p>
            </div>

            <div className="w-full space-y-1">
              <h3 className="text-6xl font-bold text-yellow-500">50+</h3>
              <p className="text-3xl font-medium">{t("hero.cities")} </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
