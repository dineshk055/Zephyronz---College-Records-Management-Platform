/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get file URL helper
const getFileUrl = (file) => {
  if (file && file.fileUrl) {
    let cleanPath = file.fileUrl.replace(/^\/?uploads\//, '');
    return `${apiUrl}/uploads/${cleanPath}`;
  }
  return null;
};

// Check if file is image helper
const isImageFile = (file) => {
  if (!file) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const extension = file.fileUrl?.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension);
};

// Enhanced File Preview Modal with Mobile Optimization
const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;
  
  const getPageUrl = (page) => {
    let cleanPath = page.replace(/^\/?uploads\//, '');
    return `${apiUrl}/uploads/${cleanPath}`;
  };

  const fileUrl = getFileUrl(file);
  const isImage = isImageFile(file);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-800/80"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-6 border-b border-slate-800/60 pb-3 sm:pb-4">
            <div className="flex-1 pr-2">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-100 line-clamp-2">{file.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Uploaded File Preview</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 p-2 sm:p-2.5 rounded-full transition-all flex-shrink-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {file.pagesData && file.pagesData.length > 0 ? (
              file.pagesData.map((page, index) => (
                <div key={index} className="relative border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden max-w-full bg-slate-950 shadow-md w-full">
                  <img src={page} alt={`Page ${index + 1}`} className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] object-contain" />
                  <div className="text-center text-xs text-slate-400 font-semibold py-2 sm:py-2.5 border-t border-slate-800 bg-slate-900">
                    Page {index + 1} of {file.pagesData.length}
                  </div>
                </div>
              ))
            ) : file.pages && file.pages.length > 0 ? (
              file.pages.map((page, index) => (
                <div key={index} className="relative border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden max-w-full bg-slate-950 shadow-md w-full">
                  <img src={getPageUrl(page)} alt={`Page ${index + 1}`} className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] object-contain" />
                  <div className="text-center text-xs text-slate-400 font-semibold py-2 sm:py-2.5 border-t border-slate-800 bg-slate-900">
                    Page {index + 1} of {file.pages.length}
                  </div>
                </div>
              ))
            ) : isImage && fileUrl ? (
              <img src={fileUrl} alt={file.title} className="w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-xl sm:rounded-2xl shadow-md border border-slate-800" />
            ) : (
              <div className="text-center p-6 sm:p-8 bg-slate-950/50 rounded-xl sm:rounded-2xl border border-slate-800/85 max-w-md w-full">
                <p className="text-slate-300 font-semibold mb-2">Preview not available for this file type</p>
                {fileUrl && (
                  <a href={fileUrl} download className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-md text-sm sm:text-base">
                    Download File
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Stats Cards with Animations
const StatsCards = ({ stats }) => {
  const cards = [
    { 
      label: "Total Files", 
      value: stats.totalFiles, 
      icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
      color: "blue"
    },
    { 
      label: "Total Users", 
      value: stats.totalUsers, 
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      color: "green"
    },
    { 
      label: "Pending Approvals", 
      value: stats.pendingApprovals, 
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "purple"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                {card.label}
              </p>
              <motion.p 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-2 text-slate-800 dark:text-slate-100"
              >
                {card.value}
              </motion.p>
            </div>
            <div className={`bg-${card.color}-500/10 p-2.5 sm:p-3.5 rounded-xl border border-${card.color}-500/20 text-${card.color}-600 dark:text-${card.color}-400 flex-shrink-0 ml-3`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Navigation Buttons Component
const NavButtons = ({ navigate, user }) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="hidden xs:inline">Home</span>
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/admin')}
        className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="hidden xs:inline">Admin</span>
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/profile')}
        className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden xs:inline">Profile</span>
      </motion.button>
    </div>
  );
};

// Mobile Top Tab Navigation
const MobileTopTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "upload", label: "Upload", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
    { id: "files", label: "Files", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
    { id: "folders", label: "Folders", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { id: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: "logs", label: "Logs", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }
  ];

  return (
    <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-20">
      <div className="flex items-center justify-around px-1 py-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 min-w-[60px] rounded-xl transition-all duration-200 ${
              activeTab === tab.id 
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <svg className={`w-5 h-5 transition-all duration-200 ${
              activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : ""
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className={`text-[10px] font-medium ${
              activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : ""
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token, user, socket } = useAuth();
  
  const [selectedFiles, setSelectedFiles] = useState([]); // array of { id, file, title }
  const [folder, setFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [securityLogs, setSecurityLogs] = useState([]);
  const [selectedLogIds, setSelectedLogIds] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalUsers: 0,
    pendingApprovals: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const fetchFolders = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/folders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setFolders(res.data.folders || []);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, [token]);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setFiles(res.data.files || []);
        setStats(prev => ({ ...prev, totalFiles: res.data.files.length }));
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(usersData);
      const pending = usersData.filter(u => (u.status === "Pending" || !u.isApproved) && u.role !== "admin").length;
      setStats(prev => ({ 
        ...prev, 
        totalUsers: usersData.length, 
        pendingApprovals: pending 
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [token]);

  const fetchSecurityLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/admin/security-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSecurityLogs(res.data.logs || []);
        setSelectedLogIds([]);
      }
    } catch (error) {
      console.error("Error fetching security logs:", error);
    }
  }, [token]);

  const handleToggleSelectLog = (id) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllLogs = () => {
    if (securityLogs.length === 0) return;
    if (selectedLogIds.length === securityLogs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(securityLogs.map(log => log._id));
    }
  };

  const handleDeleteSelectedLogs = async () => {
    if (selectedLogIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedLogIds.length} selected security logs?`)) return;
    try {
      const res = await axios.post(
        `${apiUrl}/api/admin/security-logs/delete-bulk`,
        { ids: selectedLogIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.msg || "Selected logs deleted");
        fetchSecurityLogs();
      } else {
        toast.error(res.data.msg || "Failed to delete selected logs");
      }
    } catch (error) {
      console.error("Error deleting selected logs:", error);
      toast.error(error.response?.data?.msg || "Server error");
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Delete this security log?")) return;
    try {
      const res = await axios.delete(
        `${apiUrl}/api/admin/security-logs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.msg || "Log deleted");
        fetchSecurityLogs();
      } else {
        toast.error(res.data.msg || "Failed to delete log");
      }
    } catch (error) {
      console.error("Error deleting security log:", error);
      toast.error(error.response?.data?.msg || "Server error");
    }
  };

  const handleDeleteAllLogs = async () => {
    if (!window.confirm("Delete ALL security logs? This cannot be undone.")) return;
    try {
      const res = await axios.delete(
        `${apiUrl}/api/admin/security-logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.msg || "All logs deleted");
        fetchSecurityLogs();
      } else {
        toast.error(res.data.msg || "Failed to delete logs");
      }
    } catch (error) {
      console.error("Error deleting all logs:", error);
      toast.error(error.response?.data?.msg || "Server error");
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
      fetchUsers();
      fetchSecurityLogs();
      fetchFolders();
    }
  }, [token, fetchFiles, fetchUsers, fetchSecurityLogs, fetchFolders]);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (data) => {
      console.log("Admin notification:", data);
      if (data.type === "new_registration") {
        toast.success(`New Registration: ${data.message}`, { icon: "👤", duration: 6000 });
        fetchUsers();
      } else if (data.type === "screenshot" || data.type === "screenshot_attempt") {
        toast.error(`Security Warning: ${data.message}`, { icon: "📸", duration: 8000 });
        fetchSecurityLogs();
      } else if (data.type === "download_attempt") {
        toast.error(`Security Warning: ${data.message}`, { icon: "📥", duration: 8000 });
        fetchSecurityLogs();
      } else if (data.type === "unauthorized_action") {
        toast.error(`Access Blocked: ${data.message}`, { icon: "🚫", duration: 8000 });
        fetchSecurityLogs();
      } else if (data.type === "developer_shortcut" || data.type === "suspicious_activity" || data.type === "unauthorized_print") {
        toast.error(`Suspicious Alert: ${data.message}`, { icon: "⚠️", duration: 8000 });
        fetchSecurityLogs();
      }
    });

    socket.on("user-status-changed", () => {
      fetchUsers();
    });

    socket.on("folder-created", (newFolder) => {
      setFolders((prev) => {
        if (prev.some((f) => f._id === newFolder._id)) return prev;
        return [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    socket.on("folder-renamed", ({ id, oldName, newName }) => {
      setFolders((prev) =>
        prev.map((f) => (f._id === id ? { ...f, name: newName } : f)).sort((a, b) => a.name.localeCompare(b.name))
      );
      fetchFiles();
    });

    socket.on("folder-deleted", ({ id, name }) => {
      setFolders((prev) => prev.filter((f) => f._id !== id));
      fetchFiles();
    });

    return () => {
      socket.off("notification");
      socket.off("user-status-changed");
      socket.off("folder-created");
      socket.off("folder-renamed");
      socket.off("folder-deleted");
    };
  }, [socket, fetchUsers, fetchSecurityLogs, fetchFiles, fetchFolders]);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    if (!folder.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    // Validate size of all files
    for (const item of selectedFiles) {
      if (item.file.size > 20 * 1024 * 1024) {
        toast.error(`File "${item.file.name}" exceeds the 20MB size limit`);
        return;
      }
      if (!item.title.trim()) {
        toast.error(`Please enter a title for file "${item.file.name}"`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const targetFolder = folder.trim();
      let successCount = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        setUploadProgress(0);
        
        const formData = new FormData();
        formData.append("title", item.title);
        formData.append("folder", targetFolder);
        formData.append("file", item.file);

        try {
          const res = await axios.post(`${apiUrl}/api/files/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            },
          });

          if (res.data.success) {
            successCount++;
          }
        } catch (uploadErr) {
          if (uploadErr.response && uploadErr.response.status === 409) {
            const replace = window.confirm(`${uploadErr.response.data.msg}`);
            if (replace) {
              formData.append("replace", "true");
              try {
                const resReplace = await axios.post(`${apiUrl}/api/files/upload`, formData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                  },
                  onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                  },
                });
                if (resReplace.data.success) {
                  successCount++;
                }
              } catch (replaceErr) {
                console.error("Replacement upload error:", replaceErr);
                toast.error(`Failed to replace ${item.file.name}: ${replaceErr.response?.data?.msg || replaceErr.message}`);
              }
            }
          } else {
            console.error(`Error uploading file ${item.file.name}:`, uploadErr);
            toast.error(`Failed to upload ${item.file.name}: ${uploadErr.response?.data?.msg || uploadErr.message}`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)!`);
        setSelectedFiles([]);
        setFolder("");
        setUploadProgress(0);
        fetchFiles();
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload process encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Delete this file?")) {
      try {
        const res = await axios.delete(`${apiUrl}/api/files/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          toast.success("File deleted");
          fetchFiles();
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error.response?.data?.msg || "Delete failed");
      }
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await axios.post(`${apiUrl}/api/folders`, { name: newFolderName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Folder created successfully!");
        setNewFolderName("");
        fetchFolders();
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to create folder");
    }
  };

  const handleRenameFolder = async (id) => {
    if (!editingFolderName.trim()) return;
    try {
      const res = await axios.put(`${apiUrl}/api/folders/${id}`, { name: editingFolderName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Folder renamed successfully!");
        setEditingFolderId(null);
        setEditingFolderName("");
        fetchFolders();
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (id, name) => {
    const confirm = window.confirm(`WARNING: Deleting folder "${name}" will permanently delete all files stored inside it.\n\nAre you sure you want to proceed?`);
    if (!confirm) return;
    try {
      const res = await axios.delete(`${apiUrl}/api/folders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Folder and files deleted successfully!");
        fetchFolders();
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete folder");
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const res = await axios.put(`${apiUrl}/api/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || "User approved");
      await fetchUsers();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  const handleRejectUser = async (userId) => {
    if (window.confirm("Reject this user?")) {
      try {
        const res = await axios.put(`${apiUrl}/api/users/${userId}/reject`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message || "User rejected");
        await fetchUsers();
      } catch (error) {
        console.error("Rejection error:", error);
        toast.error(error.response?.data?.message || "Rejection failed");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Delete this user?")) {
      try {
        const res = await axios.delete(`${apiUrl}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message || "User deleted");
        await fetchUsers();
      } catch (error) {
        console.error("Delete user error:", error);
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "N/A";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid Date";
    }
  };

  const filteredFiles = files.filter(file => 
    file.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.uploadedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pb-20 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          {/* Top Row - Logo and Nav Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex-shrink-0">
                <img src="/pwa-192x192.png" alt="Zephyronz" className="w-full h-full object-cover" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-sm sm:text-base lg:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 font-medium">Zephyronz Security Panel</p>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <NavButtons navigate={navigate} user={user} />
          </div>

          {/* Bottom Row - User Info and Search (Mobile) */}
          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200/30 dark:border-slate-800/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">Welcome back,</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">{user?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search Toggle for Mobile */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Role Badge */}
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
                {user?.role}
              </span>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden mt-2 overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Search files or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Top Tab Navigation - Now at the very top below header */}
      <MobileTopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8">
        {/* Security Alert */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100/50 dark:border-purple-900/50 rounded-2xl flex items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium"
        >
          <span className="text-lg sm:text-xl flex-shrink-0">🛡️</span>
          <span>Screenshots are not supported for security reasons.</span>
        </motion.div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Tabs - Desktop */}
        <div className="hidden lg:flex mb-6 sm:mb-8 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto">
          <nav className="flex space-x-6 sm:space-x-8">
            {[
              { id: "upload", label: "Upload Files", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
              { id: "files", label: "Manage Files", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
              { id: "folders", label: "Manage Folders", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
              { id: "users", label: "Manage Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { id: "logs", label: "Activity Logs", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-3 sm:pb-4 px-1 border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Upload New File</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add secure documents for authorized users</p>
                  </div>
                  
                  <form onSubmit={handleUpload} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Folder Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter or select folder (e.g. Tuition, Exams)"
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        list="folder-suggestions"
                        required
                      />
                      <datalist id="folder-suggestions">
                        {folders.map(f => (
                          <option key={f._id} value={f.name} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Select Files *
                      </label>
                      <div className="border-2 border-dashed border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-400 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer">
                        <input
                          ref={fileInputRef}
                          id="fileInput"
                          type="file"
                          multiple
                          onChange={(e) => {
                            const newFiles = Array.from(e.target.files).map(f => ({
                              file: f,
                              title: f.name.split('.').slice(0, -1).join('.'),
                              id: Math.random().toString(36).substring(7)
                            }));
                            setSelectedFiles(prev => [...prev, ...newFiles]);
                          }}
                          className="hidden"
                        />
                        <label htmlFor="fileInput" className="cursor-pointer block">
                          <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-slate-850 dark:text-slate-200 font-semibold text-sm sm:text-base">
                            Tap to browse or drag & drop files
                          </p>
                          <p className="text-slate-550 dark:text-slate-400 text-xs mt-1.5">
                            PDFs, Images, Videos, Documents (Max 20MB per file)
                          </p>
                        </label>
                      </div>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Selected Files Queue ({selectedFiles.length})
                        </label>
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {selectedFiles.map((item, idx) => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                              <div className="flex-1 min-w-0 w-full">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{item.file.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formatFileSize(item.file.size)}</p>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  value={item.title}
                                  placeholder="Enter custom title"
                                  onChange={(e) => {
                                    const updated = [...selectedFiles];
                                    updated[idx].title = e.target.value;
                                    setSelectedFiles(updated);
                                  }}
                                  className="flex-1 sm:w-48 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setSelectedFiles(selectedFiles.filter(x => x.id !== item.id))}
                                  className="text-red-500 hover:text-red-650 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{uploadProgress}% uploaded</p>
                      </div>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 text-sm sm:text-base"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        `Upload ${selectedFiles.length} File(s)`
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === "files" && (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Manage Files</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View, preview, and remove documents</p>
                    </div>
                    {/* Search - Desktop */}
                    <div className="hidden sm:block relative">
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Cards View */}
                <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFiles.length === 0 ? (
                    <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      No files found
                    </div>
                  ) : (
                    filteredFiles.map((file) => (
                      <motion.div
                        key={file._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                              {file.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {file.uploadedBy?.name || "Unknown"} • {formatFileSize(file.size)} • <span className="font-semibold text-slate-600 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{file.folder || "General"}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {formatDate(file.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => navigate(`/content/${file._id}`)}
                              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Folder</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploaded By</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploaded</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredFiles.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/10">
                            No files found
                          </td>
                        </tr>
                      ) : (
                        filteredFiles.map((file) => (
                          <tr key={file._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100">{file.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                                {file.folder || "General"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              {file.uploadedBy?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              {formatFileSize(file.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              {formatDate(file.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/content/${file._id}`)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:bg-indigo-500/5 p-2 rounded-xl transition-all"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file._id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-500/5 p-2 rounded-xl transition-all"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Manage Users</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approve registrations and manage permissions</p>
                    </div>
                    <div className="hidden sm:block relative">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Cards View */}
                <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((userItem) => (
                      <motion.div
                        key={userItem._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {userItem.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                                  {userItem.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userItem.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                userItem.role === "admin" 
                                  ? "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50" 
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50"
                              }`}>
                                {userItem.role}
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                userItem.status === "Approved" || userItem.isApproved 
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50" 
                                  : userItem.status === "Rejected"
                                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50"
                              }`}>
                                {userItem.status || (userItem.isApproved ? "Approved" : "Pending")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            {(userItem.status !== "Approved" && !userItem.isApproved) && userItem.role !== "admin" && (
                              <button
                                onClick={() => handleApproveUser(userItem._id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition-all text-xs font-semibold shadow-sm w-full"
                              >
                                Approve
                              </button>
                            )}
                            {userItem.status !== "Rejected" && userItem.role !== "admin" && (
                              <button
                                onClick={() => handleRejectUser(userItem._id)}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl transition-all text-xs font-semibold shadow-sm w-full"
                              >
                                Reject
                              </button>
                            )}
                            {userItem.role !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(userItem._id)}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl transition-all text-xs font-semibold shadow-sm w-full"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/10">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((userItem) => (
                          <tr key={userItem._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {userItem.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              {userItem.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                                userItem.role === "admin" 
                                  ? "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50" 
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50"
                              }`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                                userItem.status === "Approved" || userItem.isApproved 
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50" 
                                  : userItem.status === "Rejected"
                                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50"
                              }`}>
                                {userItem.status || (userItem.isApproved ? "Approved" : "Pending")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              {formatDate(userItem.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                {(userItem.status !== "Approved" && !userItem.isApproved) && userItem.role !== "admin" && (
                                  <button
                                    onClick={() => handleApproveUser(userItem._id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold shadow-sm"
                                  >
                                    Approve
                                  </button>
                                )}
                                {userItem.status !== "Rejected" && userItem.role !== "admin" && (
                                  <button
                                    onClick={() => handleRejectUser(userItem._id)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold shadow-sm"
                                  >
                                    Reject
                                  </button>
                                )}
                                {userItem.role !== "admin" && (
                                  <button
                                    onClick={() => handleDeleteUser(userItem._id)}
                                    className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold shadow-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Security & Activity Logs</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Monitor print blocks, shortcut triggers, and attempts</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedLogIds.length > 0 && (
                        <button
                          onClick={handleDeleteSelectedLogs}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-xl transition-all text-xs sm:text-sm shadow-md"
                        >
                          Delete {selectedLogIds.length}
                        </button>
                      )}
                      {securityLogs.length > 0 && (
                        <button
                          onClick={handleDeleteAllLogs}
                          className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-semibold py-2 px-3 sm:px-4 rounded-xl transition-all text-xs sm:text-sm border border-slate-200 dark:border-slate-700"
                        >
                          Delete All
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mobile Cards View */}
                <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {securityLogs.length === 0 ? (
                    <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      No security logs found
                    </div>
                  ) : (
                    securityLogs.map((log) => {
                      const isSelected = selectedLogIds.includes(log._id);
                      return (
                        <motion.div
                          key={log._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors ${isSelected ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectLog(log._id)}
                              className="mt-1 rounded border-slate-200 dark:border-slate-800 text-rose-600 focus:ring-rose-500 h-4 w-4 bg-white dark:bg-slate-950 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                                  {log.user?.name || "Visitor"}
                                </span>
                                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider border flex-shrink-0 ${
                                  log.eventType === "screenshot" 
                                    ? "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40" 
                                    : log.eventType === "unauthorized_action"
                                    ? "bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40"
                                    : log.eventType === "developer_shortcut"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40"
                                    : "bg-sky-500/10 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40"
                                }`}>
                                  {log.eventType?.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{log.user?.email || "Anonymous"}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{log.details}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {log.ipAddress || "N/A"} • {formatDate(log.createdAt)}
                                </span>
                                <button
                                  onClick={() => handleDeleteLog(log._id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={securityLogs.length > 0 && selectedLogIds.length === securityLogs.length}
                            onChange={handleToggleSelectAllLogs}
                            className="rounded border-slate-200 dark:border-slate-800 text-rose-600 focus:ring-rose-500 cursor-pointer h-4 w-4 bg-white dark:bg-slate-950"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {securityLogs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/10">
                            No security logs found
                          </td>
                        </tr>
                      ) : (
                        securityLogs.map((log) => {
                          const isSelected = selectedLogIds.includes(log._id);
                          return (
                            <tr key={log._id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors ${isSelected ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 w-12">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectLog(log._id)}
                                  className="rounded border-slate-200 dark:border-slate-800 text-rose-600 focus:ring-rose-500 cursor-pointer h-4 w-4 bg-white dark:bg-slate-950"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <span className="text-slate-800 dark:text-slate-100 block font-semibold">{log.user?.name || "Visitor"}</span>
                                <span className="text-slate-500 dark:text-slate-400 text-xs">{log.user?.email || "Anonymous"}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold uppercase tracking-wider border ${
                                  log.eventType === "screenshot" 
                                    ? "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40" 
                                    : log.eventType === "unauthorized_action"
                                    ? "bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40"
                                    : log.eventType === "developer_shortcut"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40"
                                    : "bg-sky-500/10 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40"
                                }`}>
                                  {log.eventType?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate" title={log.details}>
                                {log.details}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                {log.ipAddress || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                {formatDate(log.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                <button
                                  onClick={() => handleDeleteLog(log._id)}
                                  className="text-red-500 hover:text-red-700 font-semibold"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "folders" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Column 1: Create Folder */}
                <div className="md:col-span-1">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Create New Folder</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Add a folder category to group files</p>
                    <form onSubmit={handleCreateFolder} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Folder Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Tuition, Exams, Semesters"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        Create Folder
                      </button>
                    </form>
                  </div>
                </div>

                {/* Column 2: Folders List */}
                <div className="md:col-span-2">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Manage Folders</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Rename or delete existing folders (and their contents)</p>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {folders.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          No folders created yet.
                        </div>
                      ) : (
                        folders.map((folder) => {
                          const fileCount = files.filter(f => (f.folder || "General") === folder.name).length;
                          const isEditing = editingFolderId === folder._id;
                          return (
                            <div key={folder._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-550 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/80 gap-3">
                              {isEditing ? (
                                <div className="flex-1 flex items-center gap-2 w-full">
                                  <input
                                    type="text"
                                    value={editingFolderName}
                                    onChange={(e) => setEditingFolderName(e.target.value)}
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                                    required
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleRenameFolder(folder._id)}
                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingFolderId(null);
                                      setEditingFolderName("");
                                    }}
                                    className="px-3 py-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-850 dark:text-slate-200 truncate">{folder.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{fileCount} {fileCount === 1 ? "file" : "files"}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingFolderId(folder._id);
                                        setEditingFolderName(folder.name);
                                      }}
                                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                                    >
                                      Rename
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFolder(folder._id, folder.name)}
                                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg text-xs font-semibold cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {showModal && (
          <FilePreviewModal file={selectedFile} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;