import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiAlertTriangle } from "react-icons/fi";

const ScreenshotGuard = () => {
  const { isAuthenticated, token } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const logScreenshotAttempt = async (shortcut) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/security/log-screenshot`,
          { details: `Screenshot attempt detected via shortcut/key: ${shortcut}` },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to log screenshot attempt:", err);
      }
    };

    const handleKeyDown = (e) => {
      let detected = false;
      let shortcutName = "";

      // 1. PrintScreen key
      if (e.key === "PrintScreen") {
        detected = true;
        shortcutName = "PrintScreen Key";
      }
      // 2. Ctrl + Shift + S or Cmd + Shift + S (Windows/Mac Snipping Tool)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "S" || e.key === "s")) {
        detected = true;
        shortcutName = "Ctrl/Cmd + Shift + S";
      }
      // 3. Cmd + Shift + 3 or Cmd + Shift + 4 (Mac native screenshots)
      else if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        detected = true;
        shortcutName = `Cmd + Shift + ${e.key}`;
      }
      // 4. Ctrl + P (Print page shortcut)
      else if ((e.ctrlKey || e.metaKey) && (e.key === "P" || e.key === "p")) {
        e.preventDefault(); // Block print dialog
        detected = true;
        shortcutName = "Ctrl/Cmd + P (Print Shortcut)";
      }

      if (detected) {
        setShowWarning(true);
        logScreenshotAttempt(shortcutName);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAuthenticated, token]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-red-100 shadow-2xl mx-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Security Warning
        </h2>
        <p className="text-gray-700 font-semibold mb-3">
          Screenshots are strictly prohibited on this platform!
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Your attempt has been logged in the database and a security alert has been dispatched to the administrator in real-time. Continuous violations may lead to account suspension.
        </p>
        <button
          onClick={() => setShowWarning(false)}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default ScreenshotGuard;
