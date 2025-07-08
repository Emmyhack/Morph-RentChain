import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import zh from "./zh.json";
import ar from "./ar.json";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			es: { translation: es },
			fr: { translation: fr },
			zh: { translation: zh },
			ar: { translation: ar },
		},
		fallbackLng: "en",
		interpolation: { escapeValue: false },
		detection: {
			order: ["querystring", "localStorage", "navigator"],
			caches: ["localStorage"],
		},
	});

export default i18n;
