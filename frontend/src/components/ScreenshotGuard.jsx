import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiAlertTriangle } from "react-icons/fi";

const ScreenshotGuard = () => {
  const { isAuthenticated, token, isAdmin } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTitle, setWarningTitle] = useState("Security Warning");
  const [warningText, setWarningText] = useState("");

  useEffect(() => {
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

    const logSecurityEvent = async (eventType, details) => {
      if (!token || isAdmin) return; // Only log security events for logged-in non-admin users
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const activeDoc = localStorage.getItem("active_document");
        let fullDetails = details;
        if (activeDoc) {
          try {
            const doc = JSON.parse(activeDoc);
            fullDetails = `${details} on document "${doc.title}" (ID: ${doc.id || doc._id})`;
          } catch {
            // ignore
          }
        }
        await axios.post(
          `${apiUrl}/api/security/log-activity`,
          { eventType, details: fullDetails },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to log security event:", err);
      }
    };

    const triggerWarning = (title, text, eventType, detailMsg) => {
      setWarningTitle(title);
      setWarningText(text);
      setShowWarning(true);
      logSecurityEvent(eventType, detailMsg);
    };

    const handleKeyDown = (e) => {
      let detected = false;
      let shortcutName = "";
      let eventType = "suspicious_activity";
      let displayMsg = "";

      // 1. PrintScreen key
      if (e.key === "PrintScreen") {
        detected = true;
        shortcutName = "PrintScreen Key";
        eventType = "screenshot";
        displayMsg = "Screenshots are strictly prohibited on this platform!";
      }
      // 2. Ctrl + Shift + S or Cmd + Shift + S (Windows/Mac Snipping Tool)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "S" || e.key === "s")) {
        detected = true;
        shortcutName = "Ctrl/Cmd + Shift + S";
        eventType = "screenshot";
        displayMsg = "Screenshots are strictly prohibited on this platform!";
      }
      // 3. Cmd + Shift + 3 or Cmd + Shift + 4 or Cmd + Shift + 5 (Mac screenshots)
      else if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        detected = true;
        shortcutName = `Cmd + Shift + ${e.key}`;
        eventType = "screenshot";
        displayMsg = "Screenshots are strictly prohibited on this platform!";
      }
      // 4. Ctrl + P (Print page shortcut)
      else if ((e.ctrlKey || e.metaKey) && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        detected = true;
        shortcutName = "Ctrl/Cmd + P (Print Shortcut)";
        eventType = "unauthorized_print";
        displayMsg = "Printing this document is disabled for security reasons!";
      }
      // 5. F12 (Developer Tools)
      else if (e.key === "F12") {
        e.preventDefault();
        detected = true;
        shortcutName = "F12 (Developer Tools)";
        eventType = "developer_shortcut";
        displayMsg = "Developer Tools are disabled for security reasons!";
      }
      // 6. Ctrl + Shift + I or J or C (Developer Tools)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        detected = true;
        shortcutName = `Ctrl/Cmd + Shift + ${e.key.toUpperCase()} (Developer Tools)`;
        eventType = "developer_shortcut";
        displayMsg = "Developer Tools shortcuts are disabled for security reasons!";
      }
      // 7. Ctrl + U (View Source)
      else if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        detected = true;
        shortcutName = "Ctrl/Cmd + U (View Source)";
        eventType = "developer_shortcut";
        displayMsg = "Viewing page source code is disabled for security reasons!";
      }
      // 8. Ctrl + S (Save Page shortcut)
      else if ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s")) {
        const activeDoc = localStorage.getItem("active_document");
        if (activeDoc) {
          e.preventDefault();
          detected = true;
          shortcutName = "Ctrl/Cmd + S (Save Shortcut)";
          eventType = "download_attempt";
          displayMsg = "Saving this page is disabled for security reasons!";
        }
      }

      if (detected) {
        triggerWarning("Security Warning", displayMsg, eventType, `Shortcut blocked: ${shortcutName}`);
      }
    };

    const handleCopy = (e) => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        e.preventDefault();
        triggerWarning("Security Warning", "Copying document content is strictly prohibited!", "download_attempt", "Copy blocked");
      }
    };

    const handleContextMenu = (e) => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        e.preventDefault();
        triggerWarning("Security Warning", "Right-clicks are disabled to protect document security.", "download_attempt", "Right-click context menu blocked");
      }
    };

    const handleDragStart = (e) => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        e.preventDefault();
        triggerWarning("Security Warning", "Dragging document content is disabled.", "download_attempt", "Image dragging blocked");
      }
    };

    const handleWindowBlur = () => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        triggerWarning("Security Alert", "Screen capture tool or window defocus detected!", "screenshot", "Window lost focus (possible capture tool)");
      }
    };

    const handleBeforePrint = () => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        triggerWarning("Security Violation", "Printing this secure page is strictly prohibited!", "unauthorized_print", "Print action triggered");
      }
    };

    // Tab Switching detection (Visibility Change)
    const handleVisibilityChange = () => {
      const activeDoc = localStorage.getItem("active_document");
      if (document.visibilityState === "hidden" && activeDoc) {
        logSecurityEvent("tab_switch", "User switched tabs while viewing a secure document");
      }
    };

    // Developer Tools docked/opened detection
    const devtoolsDetector = setInterval(() => {
      const activeDoc = localStorage.getItem("active_document");
      if (!activeDoc) return;

      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        triggerWarning("Security Violation", "Developer tools opening detected! Access restricted.", "developer_shortcut", "Developer tools docking/opening detected");
      }
    }, 1000);

    // Trap console object getters (secondary devtools checker)
    const trapElement = new Image();
    Object.defineProperty(trapElement, "id", {
      get: function () {
        const activeDoc = localStorage.getItem("active_document");
        if (activeDoc) {
          triggerWarning("Security Violation", "Developer Tools inspection detected!", "developer_shortcut", "Console debugger getter triggered");
        }
      }
    });

    const consoleTrapInterval = setInterval(() => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        console.log("%c", trapElement);
      }
    }, 1500);

    // Inject print blocking CSS and disable user select
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @media print {
        body {
          display: none !important;
        }
      }
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      img {
        user-select: none !important;
        -webkit-user-drag: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
      clearInterval(devtoolsDetector);
      clearInterval(consoleTrapInterval);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, token, isAdmin]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-center relative overflow-hidden glass-panel">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <FiAlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-extrabold text-red-500 mb-2">
          {warningTitle}
        </h2>
        <p className="text-slate-100 text-sm font-semibold mb-3">
          {warningText}
        </p>
        <p className="text-slate-400 text-[11px] leading-relaxed mb-6">
          This security incident has been logged. Continuous violations will dispatch alert reports directly to the administrator and may trigger automatic account locks.
        </p>
        <button
          onClick={() => setShowWarning(false)}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-98 text-xs uppercase tracking-wider"
        >
          Acknowledge & Dismiss
        </button>
      </div>
    </div>
  );
};

export default ScreenshotGuard;
