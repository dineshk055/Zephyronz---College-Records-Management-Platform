import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import BottomNavigation from "./components/BottomNavigation";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import ScreenshotGuard from "./components/ScreenshotGuard";
import SplashScreen from "./components/SplashScreen";
import { useTheme } from "./context/ThemeContext";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds splash screen
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className={`theme-transition min-h-screen pb-24 ${theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      <ScreenshotGuard />
      <Navbar />
      <div className="animate-fade-in">
        <AppRoutes />
      </div>
      <BottomNavigation />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;