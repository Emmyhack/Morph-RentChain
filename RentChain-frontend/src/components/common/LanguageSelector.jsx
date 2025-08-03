import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
	const { i18n } = useTranslation();

	const changeLanguage = (lng) => {
		i18n.changeLanguage(lng);
	};

	return (
		<select
			onChange={(e) => changeLanguage(e.target.value)}
			value={i18n.language}
			className="text-2xl font-semibold bg-transparent border-none outline-none cursor-pointer"
		>
			<option value="en">US English</option>
			<option value="es">ES Español</option>
			<option value="fr">FR Français</option>
			<option value="zh">CN 中文</option>
			<option value="ar">SA العربية</option>
		</select>
	);
};

export default LanguageSelector;
