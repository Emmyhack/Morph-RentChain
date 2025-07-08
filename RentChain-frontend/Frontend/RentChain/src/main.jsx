import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import "./index.css";
import App from "./App.jsx";
import i18n from "./i18n";
import { Web3Provider } from "./context/Web3Context";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<I18nextProvider i18n={i18n}>
			<Web3Provider>
				<App />
			</Web3Provider>
		</I18nextProvider>
	</StrictMode>
);
