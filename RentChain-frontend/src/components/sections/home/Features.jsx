import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaRegStar } from "react-icons/fa";
import { IoGlobeOutline } from "react-icons/io5";
import { LuShield } from "react-icons/lu";
import { MdOutlinePayment } from "react-icons/md";
import { IoChatbubbleOutline } from "react-icons/io5";

export default function Features() {
	const { t } = useTranslation();
	const [features, setFeatures] = useState([]);

	const iconComponents = {
		IoLockClosedOutline: IoLockClosedOutline,
		FaRegStar: FaRegStar,
		IoGlobeOutline: IoGlobeOutline,
		LuShield: LuShield,
		MdOutlinePayment: MdOutlinePayment,
		IoChatbubbleOutline: IoChatbubbleOutline,
	};

	useEffect(() => {
		// Load the features structure with icons
		fetch("/Features.json")
			.then((res) => res.json())
			.then((featuresData) => {
				// Get translated content
				const translatedFeatures = t("features.items", { returnObjects: true });

				// Merge the icon data with translated content
				const mergedFeatures = featuresData.map((feature) => {
					const translated = translatedFeatures.find((tf) => tf.id === feature.id);
					return {
						...feature,
						title: translated?.title || feature.title,
						desc: translated?.desc || feature.desc,
					};
				});

				setFeatures(mergedFeatures);
			})
			.catch((err) => console.log(err));
	}, [t]);

	return (
		<div className="w-full section">
			<div className="section-page">
				<div className="text-center">
					<h3 className="text-6xl font-semibold mb-8">{t("features.title")}</h3>
					<p className="text-3xl font-normal text-secondary normal-case max-w-7xl m-auto">{t("features.subtitle")}</p>
				</div>

				<div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 justify-between gap-16 mt-20">
					{features.map((feature) => {
						const IconComponent = iconComponents[feature.icon] || IoLockClosedOutline;
						return (
							<div
								key={feature.id}
								className="w-full space-y-10 text-center shadow-[1px_1px_5px_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_5px_rgba(0,0,0,0.7)] rounded-xl py-10 px-16 transition-all duration-300"
							>
								<div className="flex justify-center">
									<IconComponent className="text-6xl text-primary" />
								</div>
								<h4 className="text-4xl font-medium">{feature.title}</h4>
								<p className="text-3xl font-normal normal-case text-secondary">{feature.desc}</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
