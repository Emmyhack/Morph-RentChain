import Banner from "../components/sections/home/Banner";
import GridShowcase from "../components/sections/home/Features";
import Hero from "../components/sections/home/Hero";
// import ConnectWalletPopup from "../components/ui/ConnectWalletPopup";

export default function Home() {
  return (
    <div className="w-full h-full">
      {/* <ConnectWalletPopup /> */}
      <Hero />
      <GridShowcase />
      <Banner />
    </div>
  );
}
