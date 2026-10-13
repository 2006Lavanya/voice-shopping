import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import VoiceAssistant from "../components/VoiceAssistant.jsx";
import HandsFreeIndicator from "../components/HandsFreeIndicator.jsx";
import ThemeSettingsPanel from "../components/ThemeSettingsPanel.jsx";
import { useI18n } from "../context/I18nContext.jsx";

const MainLayout = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <a href="#main" className="sr-only-focusable fixed top-2 left-2 z-[70] bg-brand-pink text-white px-4 py-2 rounded-full">
        {t("nav.skip")}
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <VoiceAssistant />
      <HandsFreeIndicator />
      <ThemeSettingsPanel />
    </div>
  );
};

export default MainLayout;
