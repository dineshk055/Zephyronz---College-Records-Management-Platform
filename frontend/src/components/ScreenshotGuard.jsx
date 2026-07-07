import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";

const ScreenshotGuard = () => {
  const { token, user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isScreenBlurred, setIsScreenBlurred] = useState(false);

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
      // Dev Tools are enabled (not restricted)

      if (detected) {
        triggerPopup("screenshot", "Taking screenshots or printing is restricted on this platform for security reasons.", `Blocked: ${shortcutName}`);
      }
    };

    // Prevent copy
    const handleCopy = (e) => {
      e.preventDefault();
      triggerToast("download_attempt", "Copying content is disabled.", "Copy blocked");
    };

    // Right-click context menu allowed for developer tools access

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

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    // Handle mobile three-finger screenshot gesture / touch
    const handleTouchStart = (e) => {
      if (e.touches.length >= 3) {
        e.preventDefault();
        triggerPopup(
          "screenshot",
          "Taking screenshots or using three-finger gestures is restricted for security reasons.",
          "Blocked: Three-finger gesture"
        );
        setIsScreenBlurred(true);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length >= 3) {
        e.preventDefault();
        setIsScreenBlurred(true);
      }
    };

    const handleTouchEnd = () => {
      setIsScreenBlurred(false);
    };

    // Handle mobile window blur / focus loss (usually triggered by hardware screenshot combo)
    const handleWindowBlur = () => {
      setIsScreenBlurred(true);
      logSecurityEvent("screenshot", "Window lost focus (potential mobile screenshot attempt)");
    };

    const handleWindowFocus = () => {
      setIsScreenBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true);
        logSecurityEvent("screenshot", "Visibility changed to hidden (potential mobile screenshot attempt)");
      } else {
        setIsScreenBlurred(false);
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyDown);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleEscapeKey);

    if (isMobile) {
      window.addEventListener("blur", handleWindowBlur);
      window.addEventListener("focus", handleWindowFocus);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("touchstart", handleTouchStart, { passive: false });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("touchcancel", handleTouchEnd);
    }

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleEscapeKey);

      if (isMobile) {
        window.removeEventListener("blur", handleWindowBlur);
        window.removeEventListener("focus", handleWindowFocus);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("touchcancel", handleTouchEnd);
      }
    };
  }, [token, isAdmin, showWarning]);

  return (
    <>
      {isScreenBlurred && (
        <div className="fixed inset-0 z-[99999] bg-slate-955/95 backdrop-blur-lg flex flex-col items-center justify-center text-center p-6 pointer-events-auto">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <FiAlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Content Protected</h2>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Screenshots and background viewing are restricted on this platform for security reasons.
          </p>
        </div>
      )}

      {showWarning && (
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
      )}
    </>
  );
};

export default ScreenshotGuard;