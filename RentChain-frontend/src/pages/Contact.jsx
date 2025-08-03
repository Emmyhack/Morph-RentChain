import { useTranslation } from "react-i18next";

export default function Contact() {
	const { t } = useTranslation();
	return <div>{t("contact")}</div>;
}
