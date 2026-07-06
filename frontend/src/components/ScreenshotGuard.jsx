import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";

const ScreenshotGuard = () => {
  const { token, user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  useEffect(() => {
    // Enable native secure flag for mobile apps
    const enableNativeSecure = () => {
      try {
        if (window.Android) {
          if (typeof window.Android.enableSecure === "function") {
            window.Android.enableSecure();
          } else if (typeof window.Android.setFlagSecure === "function") {
            window.Android.setFlagSecure(true);
          }
        }
        if (window.JSInterface) {
          if (typeof window.JSInterface.enableSecure === "function") {
            window.JSInterface.enableSecure();
          } else if (typeof window.JSInterface.setFlagSecure === "function") {
            window.JSInterface.setFlagSecure(true);
          }
        }
      } catch (err) {
        console.error("Failed to enable native secure flag:", err);
      }
    };

    enableNativeSecure();

    // Log security events
    const logSecurityEvent = async (eventType, details) => {
      if (!token || isAdmin) return; // Don't log for admin users
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        await axios.post(
          `${apiUrl}/api/security/log-activity`,
          { eventType, details },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        // Silently fail - don't interrupt user experience
        console.debug("Security log failed:", err);
      }
    };

    // Show warning popup
    const triggerPopup = (eventType, msg, detailMsg) => {
      setWarningMessage(msg);
      setShowWarning(true);
      logSecurityEvent(eventType, detailMsg);
    };

    // Show toast notification
    const triggerToast = (eventType, msg, detailMsg) => {
      toast.error(msg, { icon: '🛡️' });
      logSecurityEvent(eventType, detailMsg);
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
      let detected = false;
      let shortcutName = "";

      // PrintScreen key
      if (e.key === "PrintScreen") {
        detected = true;
        shortcutName = "PrintScreen Key";
        // Try to prevent clipboard capture
        try {
          navigator.clipboard.writeText("Screenshots are disabled for security reasons.");
        } catch {
          // Ignore clipboard errors
        }
      }
      // Snipping Tool / Mac Screenshots
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["s", "S", "3", "4", "5"].includes(e.key)) {
        detected = true;
        shortcutName = "Snipping Tool / Mac Screenshot";
      }
      // Print shortcut
      else if ((e.ctrlKey || e.metaKey) && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        detected = true;
        shortcutName = "Print Shortcut";
      }
      // Dev Tools
      else if (e.key === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key))) {
        e.preventDefault();
        triggerToast("developer_shortcut", "Developer tools are restricted.", "Dev Tools Shortcut");
        return; // Use toast for dev tools so it's less intrusive
      }

      if (detected) {
        triggerPopup("screenshot", "Taking screenshots or printing is restricted on this platform for security reasons.", `Blocked: ${shortcutName}`);
      }
    };

    // Prevent copy
    const handleCopy = (e) => {
      e.preventDefault();
      triggerToast("download_attempt", "Copying content is disabled.", "Copy blocked");
    };

    // Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Prevent drag
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Prevent paste
    const handlePaste = (e) => {
      e.preventDefault();
      triggerToast("paste_attempt", "Pasting content is disabled.", "Paste blocked");
    };

    // Handle escape key to close warning
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && showWarning) {
        setShowWarning(false);
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyDown);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleEscapeKey);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [token, isAdmin, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-fade-in pointer-events-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-red-500/30 shadow-2xl text-center relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 rounded-t-2xl"></div>
        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <FiAlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Security Alert
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
          {warningMessage}
        </p>
        <button
          onClick={() => setShowWarning(false)}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm"
        >
          OK, I Understand
        </button>
      </div>
    </div>
  );
};

export default ScreenshotGuard;