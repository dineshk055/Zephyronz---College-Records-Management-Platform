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
    if (!isAuthenticated || !token || isAdmin) return;

    const logSecurityEvent = async (eventType, details) => {
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
      // 3. Cmd + Shift + 3 or Cmd + Shift + 4 (Mac native screenshots)
      else if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        detected = true;
        shortcutName = `Cmd + Shift + ${e.key}`;
        eventType = "screenshot";
        displayMsg = "Screenshots are strictly prohibited on this platform!";
      }
      // 4. Ctrl + P (Print page shortcut)
      else if ((e.ctrlKey || e.metaKey) && (e.key === "P" || e.key === "p")) {
        e.preventDefault(); // Block print dialog
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
      // 6. Ctrl + Shift + I or J (Developer Tools)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) {
        e.preventDefault();
        detected = true;
        shortcutName = "Ctrl/Cmd + Shift + I/J (Developer Tools)";
        eventType = "developer_shortcut";
        displayMsg = "Developer Tools are disabled for security reasons!";
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
          displayMsg = "Saving/downloading this document is disabled for security reasons!";
        }
      }

      if (detected) {
        setWarningTitle("Security Warning");
        setWarningText(displayMsg);
        setShowWarning(true);
        logSecurityEvent(eventType, `Shortcut blocked: ${shortcutName}`);
      }
    };

    const handleCopy = (e) => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        e.preventDefault();
        setWarningTitle("Security Warning");
        setWarningText("Copying document content is strictly prohibited!");
        setShowWarning(true);
        logSecurityEvent("download_attempt", "Copy blocked");
      }
    };

    const handleContextMenu = (e) => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        e.preventDefault();
        setWarningTitle("Security Warning");
        setWarningText("Right-clicks are disabled to protect document security.");
        setShowWarning(true);
        logSecurityEvent("download_attempt", "Right-click context menu blocked");
      }
    };

    const handleDragStart = (e) => {
      const activeDoc = localStorage.getItem("active_document");
      if (activeDoc) {
        e.preventDefault();
        setWarningTitle("Security Warning");
        setWarningText("Dragging document content is disabled for security reasons.");
        setShowWarning(true);
        logSecurityEvent("download_attempt", "Image dragging blocked");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, [isAuthenticated, token, isAdmin]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-red-100 shadow-2xl mx-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          {warningTitle}
        </h2>
        <p className="text-gray-700 font-semibold mb-3">
          {warningText}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Your action has been logged in the system database and a security alert has been dispatched to the administrator in real-time. Continuous violations may lead to account suspension.
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
