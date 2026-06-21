/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

// Get file URL helper
const getFileUrl = (file) => {
  if (file && file.fileUrl) {
    let cleanPath = file.fileUrl.replace(/^\/?uploads\//, '');
    return `${import.meta.env.VITE_API_URL}/uploads/${cleanPath}`;
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

// File preview modal
const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;
  
  const getPageUrl = (page) => {
    let cleanPath = page.replace(/^\/?uploads\//, '');
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${apiUrl}/uploads/${cleanPath}`;
  };

  const fileUrl = getFileUrl(file);
  const isImage = isImageFile(file);
  
  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all border border-slate-800/80" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-850/60 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-100">{file.title}</h3>
              <p className="text-sm text-slate-400 mt-1">Uploaded File Preview</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 p-2.5 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            {file.pagesData && file.pagesData.length > 0 ? (
              file.pagesData.map((page, index) => (
                <div key={index} className="relative border border-slate-800 rounded-2xl overflow-hidden max-w-full bg-slate-950 shadow-md">
                  <img src={page} alt={`Page ${index + 1}`} className="w-full h-auto max-h-[70vh] object-contain" />
                  <div className="text-center text-xs text-slate-450 font-semibold py-2.5 border-t border-slate-800 bg-slate-900">
                    Page {index + 1} of {file.pagesData.length}
                  </div>
                </div>
              ))
            ) : file.pages && file.pages.length > 0 ? (
              file.pages.map((page, index) => (
                <div key={index} className="relative border border-slate-800 rounded-2xl overflow-hidden max-w-full bg-slate-950 shadow-md">
                  <img src={getPageUrl(page)} alt={`Page ${index + 1}`} className="w-full h-auto max-h-[70vh] object-contain" />
                  <div className="text-center text-xs text-slate-450 font-semibold py-2.5 border-t border-slate-800 bg-slate-900">
                    Page {index + 1} of {file.pages.length}
                  </div>
                </div>
              ))
            ) : isImage && fileUrl ? (
              <img src={fileUrl} alt={file.title} className="w-full max-h-[70vh] object-contain rounded-2xl shadow-md border border-slate-800" />
            ) : (
              <div className="text-center p-8 bg-slate-950/50 rounded-2xl border border-slate-800/85 max-w-md w-full">
                <p className="text-slate-350 font-semibold mb-2">Preview not available for this file type</p>
                {fileUrl && (
                  <a href={fileUrl} download className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-650 text-white px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-md">
                    Download File
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Cards
const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800/60 hover:border-blue-500/40 dark:hover:border-blue-500/45 transition-all duration-300 shadow-sm group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-505 dark:text-slate-400 text-sm font-medium">Total Files</p>
          <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-100">{stats.totalFiles}</p>
        </div>
        <div className="bg-blue-505/10 p-3.5 rounded-xl border border-blue-500/20 text-blue-605 group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
      </div>
    </div>
    
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800/60 hover:border-green-500/40 dark:hover:border-green-500/45 transition-all duration-300 shadow-sm group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-505 dark:text-slate-400 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-100">{stats.totalUsers}</p>
        </div>
        <div className="bg-green-555/10 p-3.5 rounded-xl border border-green-500/20 text-green-600 group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800/60 hover:border-purple-500/40 dark:hover:border-purple-500/45 transition-all duration-300 shadow-sm group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-505 dark:text-slate-400 text-sm font-medium">Pending Approvals</p>
          <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-100">{stats.pendingApprovals}</p>
        </div>
        <div className="bg-purple-555/10 p-3.5 rounded-xl border border-purple-500/20 text-purple-650 dark:text-purple-400 group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { token, user, socket } = useAuth();
  
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
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

  const fetchFiles = useCallback(async () => {
    await Promise.resolve();
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/files`, {
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
    await Promise.resolve();
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/security-logs`, {
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
    if (!window.confirm(`Are you sure you want to delete the ${selectedLogIds.length} selected security logs?`)) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/security-logs/delete-bulk`,
        { ids: selectedLogIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.msg || "Selected security logs deleted successfully");
        fetchSecurityLogs();
      } else {
        toast.error(res.data.msg || "Failed to delete selected security logs");
      }
    } catch (error) {
      console.error("Error deleting selected logs:", error);
      toast.error(error.response?.data?.msg || "Server error deleting selected logs");
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this security log?")) return;
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/security-logs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.msg || "Security log deleted successfully");
        fetchSecurityLogs();
      } else {
        toast.error(res.data.msg || "Failed to delete security log");
      }
    } catch (error) {
      console.error("Error deleting security log:", error);
      toast.error(error.response?.data?.msg || "Server error deleting log");
    }
  };

  const handleDeleteAllLogs = async () => {
    if (!window.confirm("Are you sure you want to delete ALL security logs? This action cannot be undone.")) return;
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/security-logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.msg || "All security logs deleted successfully");
        fetchSecurityLogs();
      } else {
        toast.error(res.data.msg || "Failed to delete all security logs");
      }
    } catch (error) {
      console.error("Error deleting all security logs:", error);
      toast.error(error.response?.data?.msg || "Server error deleting logs");
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    if (token) {
      fetchFiles();
      fetchUsers();
      fetchSecurityLogs();
    }
  }, [token, fetchFiles, fetchUsers, fetchSecurityLogs]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (data) => {
      console.log("Admin notification received:", data);
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

    return () => {
      socket.off("notification");
      socket.off("user-status-changed");
    };
  }, [socket, fetchUsers, fetchSecurityLogs]);

  // Upload file handler with progress
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    
    if (!file) {
      alert("Please select a file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/files/upload`, formData, {
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
        alert("File uploaded successfully!");
        setTitle("");
        setFile(null);
        setUploadProgress(0);
        fetchFiles();
        
        // Reset file input
        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";
      } else {
        alert(res.data.msg || "Upload failed");
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.msg || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete file handler
  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/files/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          alert("File deleted successfully");
          fetchFiles();
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.msg || "Delete failed");
      }
    }
  };

  // Approve user handler
  const handleApproveUser = async (userId) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message || "User approved successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Approval error:", error);
      alert(error.response?.data?.message || "Approval failed");
    }
  };

  // Reject user handler
  const handleRejectUser = async (userId) => {
    if (window.confirm("Are you sure you want to reject this user?")) {
      try {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}/reject`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.message || "User rejected successfully");
        await fetchUsers();
      } catch (error) {
        console.error("Rejection error:", error);
        alert(error.response?.data?.message || "Rejection failed");
      }
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.message || "User deleted successfully");
        await fetchUsers();
      } catch (error) {
        console.error("Delete user error:", error);
        alert(error.response?.data?.message || "Delete failed");
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "N/A";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
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

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat bg-fixed transition-colors duration-300 flex flex-col pb-16"
      style={{ backgroundImage: `url('/campus_bg.jpg')` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/85 backdrop-blur-[2px] transition-colors duration-300"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/60 shadow-sm transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/pwa-192x192.png" 
                    alt="Zephyronz Emblem" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Zephyronz Security & Records Panel</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back,</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{user?.name}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold capitalize">{user?.role}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-650 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900/15">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          
          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Tabs */}
          <div className="mb-8 border-b border-slate-200/60 dark:border-slate-800/60">
            <nav className="flex space-x-8">
              {[
                { id: "upload", label: "Upload Files", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
                { id: "files", label: "Manage Files", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
                { id: "users", label: "Manage Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
                { id: "logs", label: "Activity Logs", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="max-w-2xl mx-auto">
              <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/65 dark:border-slate-800/80 shadow-sm rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload New File</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Add secure documents accessible to authorized users</p>
                </div>
                
                <form onSubmit={handleUpload} className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      File Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Select File *
                    </label>
                    <div className="border-2 border-dashed border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-400 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-955 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 cursor-pointer">
                      <input
                        id="fileInput"
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                      />
                      <label htmlFor="fileInput" className="cursor-pointer">
                        <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">
                          {file ? file.name : "Click to browse or drag and drop"}
                        </p>
                        <p className="text-slate-500 dark:text-slate-450 text-xs mt-1.5">
                          {file ? formatFileSize(file.size) : "Supports: PDF, Images, Documents (Max 10MB)"}
                        </p>
                      </label>
                    </div>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 text-center">{uploadProgress}% uploaded</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 text-white py-3.5 rounded-2xl font-semibold hover:from-indigo-750 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] shadow-lg shadow-indigo-650/15"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      "Upload File"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === "files" && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/65 dark:border-slate-800/80 shadow-sm rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Manage Files</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">View, preview, and remove uploaded documents</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploaded By</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {files.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-550 dark:text-slate-400 bg-slate-50/10">
                          No files uploaded yet
                        </td>
                      </tr>
                    ) : (
                      files.map((file) => (
                        <tr key={file._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100">{file.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-350">
                            {file.uploadedBy?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-350">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-350">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedFile(file);
                                  setShowModal(true);
                                }}
                                className="text-indigo-605 dark:text-indigo-400 hover:text-indigo-500 hover:bg-indigo-500/5 p-2 rounded-xl transition-all"
                                title="Preview"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file._id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/5 p-2 rounded-xl transition-all"
                                title="Delete"
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
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/65 dark:border-slate-800/80 shadow-sm rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Manage Users</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Approve registrations and manage user permissions</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/10">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((userItem) => (
                        <tr key={userItem._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100 font-semibold">
                            {userItem.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-350">
                            {userItem.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                              userItem.role === "admin" 
                                ? "bg-purple-500/10 text-purple-650 border-purple-500/20 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50" 
                                : "bg-blue-500/10 text-blue-650 border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50"
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                              userItem.status === "Approved" || userItem.isApproved 
                                ? "bg-emerald-500/10 text-emerald-650 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50" 
                                : userItem.status === "Rejected"
                                ? "bg-rose-500/10 text-rose-650 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                                : "bg-amber-500/10 text-amber-655 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50"
                            }`}>
                              {userItem.status || (userItem.isApproved ? "Approved" : "Pending")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-350">
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

          {/* Activity Logs Tab */}
          {activeTab === "logs" && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/65 dark:border-slate-800/80 shadow-sm rounded-3xl overflow-hidden animate-fadeIn">
              <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Security & Activity Logs</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Monitor print blocks, developer shortcut triggers, screenshot attempts, and screen blurs</p>
                </div>
                <div className="flex gap-2.5">
                  {selectedLogIds.length > 0 && (
                    <button
                      onClick={handleDeleteSelectedLogs}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-md text-sm cursor-pointer border border-rose-705/30"
                    >
                      Delete Selected ({selectedLogIds.length})
                    </button>
                  )}
                  {securityLogs.length > 0 && (
                    <button
                      onClick={handleDeleteAllLogs}
                      className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-semibold py-2 px-4 rounded-xl transition-all shadow-sm text-sm border border-slate-200 dark:border-slate-700"
                    >
                      Delete All Logs
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={securityLogs.length > 0 && selectedLogIds.length === securityLogs.length}
                          onChange={handleToggleSelectAllLogs}
                          className="rounded border-slate-200 dark:border-slate-800 text-rose-600 focus:ring-rose-500 cursor-pointer h-4 w-4 bg-white dark:bg-slate-950"
                          title="Select All Logs"
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
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-505 dark:text-slate-400 bg-slate-50/10">
                          No security logs found
                        </td>
                      </tr>
                    ) : (
                      securityLogs.map((log) => {
                        const isSelected = selectedLogIds.includes(log._id);
                        return (
                          <tr key={log._id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-955/40 transition-colors ${isSelected ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 w-12">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectLog(log._id)}
                                className="rounded border-slate-200 dark:border-slate-800 text-rose-600 focus:ring-rose-500 cursor-pointer h-4 w-4 bg-white dark:bg-slate-955"
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
                                  ? "bg-orange-500/10 text-orange-655 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40"
                                  : log.eventType === "developer_shortcut"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-450 dark:border-amber-900/40"
                                  : "bg-sky-500/10 text-sky-650 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40"
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-505 dark:text-slate-400">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <button
                                onClick={() => handleDeleteLog(log._id)}
                                className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                                title="Delete this log"
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
        </div>
      </div>

      {/* File Preview Modal */}
      {showModal && (
        <FilePreviewModal file={selectedFile} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;