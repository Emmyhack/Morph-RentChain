import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageNavigation from "../components/common/PageNavigation";
import { useState } from "react";

export default function AppLayout() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div className={`w-full min-h-screen m-auto max-w-[185rem]${darkMode ? ' dark' : ''}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Outlet />
      <Footer />
      <PageNavigation />
    </div>
  );
}
