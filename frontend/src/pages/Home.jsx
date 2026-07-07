import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  FiFileText,
  FiVideo,
  FiImage,
  FiAlertCircle,
  FiX,
  FiArrowRight,
  FiLock,
  FiSearch,
  FiFolder,
  FiArrowLeft
} from "react-icons/fi";
import { FaFilePdf, FaWhatsapp, FaCoins } from "react-icons/fa";
import homeBg from "../assets/home_bg.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { token, user, socket } = useAuth();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode] = useState("list");
  const [activeFolder, setActiveFolder] = useState(null);

  // Floating WhatsApp Support Form State
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user?.name || "",
    message: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Admin Upload Modal States for folder page
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    try {
      setUploadLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const targetFolder = activeFolder;
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
        setUploadProgress(0);
        setShowUploadModal(false);
        fetchFiles();
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload process encountered an error.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Fetch files helper
  const fetchFiles = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${apiUrl}/api/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFiles(response.data.files || []);
      } else {
        setError("Failed to load records.");
      }
    } catch (err) {
      console.error("Error fetching records:", err);
      setError(err.response?.data?.msg || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch folders helper
  const fetchFolders = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${apiUrl}/api/folders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFolders(response.data.folders || []);
      }
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchFiles();
        fetchFolders();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token, fetchFiles, fetchFolders]);

  // Socket.io listener for real-time instant updates
  useEffect(() => {
    if (!socket) return;

    socket.on("file-uploaded", (newFile) => {
      setFiles((prev) => {
        if (prev.some((f) => f._id === newFile._id)) return prev;
        return [newFile, ...prev];
      });
      toast.success(`New document added: "${newFile.title}"!`, {
        icon: "✨",
        style: {
          background: "#FFFFFF",
          color: "#1E293B",
          border: "1px solid #E2E8F0"
        }
      });
    });

    socket.on("file-deleted", (deletedId) => {
      setFiles((prev) => prev.filter((f) => f._id !== deletedId));
    });

    socket.on("folder-created", (newFolder) => {
      setFolders((prev) => {
        if (prev.some((f) => f._id === newFolder._id)) return prev;
        return [...prev, newFolder];
      });
      toast.success(`New folder created: "${newFolder.name}"!`, {
        icon: "📂",
        style: {
          background: "#FFFFFF",
          color: "#1E293B",
          border: "1px solid #E2E8F0"
        }
      });
    });

    socket.on("folder-renamed", ({ id, oldName, newName }) => {
      setFolders((prev) =>
        prev.map((f) => (f._id === id ? { ...f, name: newName } : f))
      );
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.folder === oldName ? { ...file, folder: newName } : file
        )
      );
      // Update active folder if it was the renamed one
      setActiveFolder((prev) => (prev === oldName ? newName : prev));
    });

    socket.on("folder-deleted", ({ id, name }) => {
      setFolders((prev) => prev.filter((f) => f._id !== id));
      setFiles((prevFiles) => prevFiles.filter((file) => file.folder !== name));
      // Clear active folder if it was the deleted one
      setActiveFolder((prev) => (prev === name ? null : prev));
    });

    return () => {
      socket.off("file-uploaded");
      socket.off("file-deleted");
      socket.off("folder-created");
      socket.off("folder-renamed");
      socket.off("folder-deleted");
    };
  }, [socket]);

  // Handle support form inputs
  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  // Submit to WhatsApp
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { name, message } = contactForm;

    if (!name.trim() || !message.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setFormSubmitting(true);

    const formattedText = 
      `*ZEPHYRONZ SUPPORT INQUIRY*\n` +
      `---------------------------\n` +
      `*Name:* ${name}\n` +
      `*Message:* ${message}`;

    const adminWhatsAppNumber = "916369679025";
    const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(formattedText)}`;

    setTimeout(() => {
      setFormSubmitting(false);
      setShowWhatsappForm(false);
      toast.success("Redirecting to WhatsApp support...");
      window.open(whatsappUrl, "_blank");
      setContactForm(prev => ({ ...prev, message: "" }));
    }, 800);
  };

  // Get file icon based on type
  const getFileIcon = (mimetype, originalName) => {
    const extension = originalName?.split('.').pop()?.toLowerCase();
    if (mimetype?.includes('pdf') || extension === "pdf") return <FaFilePdf className="w-5 h-5 text-white" />;
    if (mimetype?.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return <FiImage className="w-5 h-5 text-white" />;
    if (mimetype?.startsWith('video') || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(extension)) return <FiVideo className="w-5 h-5 text-white" />;
    return <FiFileText className="w-5 h-5 text-white" />;
  };

  // Get impressive button colors based on file type - Light theme vibrant colors
  const getButtonColor = (mimetype, originalName) => {
    const extension = originalName?.split('.').pop()?.toLowerCase();
    if (mimetype?.includes('pdf') || extension === "pdf") {
      return "from-rose-500 via-red-500 to-pink-600 hover:from-rose-600 hover:via-red-600 hover:to-pink-700 shadow-rose-500/40";
    }
    if (mimetype?.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return "from-emerald-400 via-green-500 to-teal-500 hover:from-emerald-500 hover:via-green-600 hover:to-teal-600 shadow-emerald-500/40";
    }
    if (mimetype?.startsWith('video') || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(extension)) {
      return "from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-500 hover:via-sky-600 hover:to-blue-700 shadow-sky-500/40";
    }
    return "from-violet-400 via-purple-500 to-fuchsia-600 hover:from-violet-500 hover:via-purple-600 hover:to-fuchsia-700 shadow-purple-500/40";
  };

  // Get background pattern for each card type
  const getCardPattern = (mimetype, originalName) => {
    const extension = originalName?.split('.').pop()?.toLowerCase();
    if (mimetype?.includes('pdf') || extension === "pdf") {
      return "after:bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2)_0%,_transparent_60%)]";
    }
    if (mimetype?.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return "after:bg-[radial-gradient(circle_at_70%_20%,_rgba(255,255,255,0.25)_0%,_transparent_60%)]";
    }
    if (mimetype?.startsWith('video') || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(extension)) {
      return "after:bg-[radial-gradient(circle_at_50%_80%,_rgba(255,255,255,0.2)_0%,_transparent_60%)]";
    }
    return "after:bg-[radial-gradient(circle_at_40%_40%,_rgba(255,255,255,0.25)_0%,_transparent_60%)]";
  };

  // Folder gradients (vibrant, premium light/dark compatible gradients)
  const folderGradients = [
    "from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:via-orange-600 hover:to-rose-650 shadow-orange-500/30",
    "from-blue-400 via-indigo-500 to-violet-500 hover:from-blue-500 hover:via-indigo-600 hover:to-violet-600 shadow-indigo-500/30",
    "from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-600 shadow-teal-500/30",
    "from-pink-400 via-rose-500 to-red-500 hover:from-pink-500 hover:via-rose-600 hover:to-red-600 shadow-rose-500/30",
    "from-fuchsia-400 via-purple-500 to-indigo-500 hover:from-fuchsia-500 hover:via-purple-600 hover:to-indigo-650 shadow-purple-500/30",
  ];

  const getFolderColor = (folderName) => {
    let hash = 0;
    for (let i = 0; i < folderName.length; i++) {
      hash = folderName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % folderGradients.length;
    return folderGradients[index];
  };

  // Filter files based on search and activeFolder
  const filteredFiles = files.filter(file => {
    const fileFolder = file.folder || "General";
    if (activeFolder !== null && fileFolder !== activeFolder) {
      return false;
    }
    return (
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundImage: `url(${homeBg})`,
      }}
    >
      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        
        {/* Header Section */}
        <header className="pt-12 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                  <FaCoins className="text-yellow-300" />
                  {activeFolder ? activeFolder : "Financial Hub"}
                </h1>
                <p className="text-white/90 text-sm md:text-base mt-1 drop-shadow-md font-medium">
                  {activeFolder ? `Viewing files in ${activeFolder}` : `Welcome back, ${user?.name || "Student"}!`}
                </p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white drop-shadow-md">{files.length}</div>
                  <div className="text-xs text-white/80 font-medium">Documents</div>
                </div>
                <div className="w-px h-10 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white drop-shadow-md">24/7</div>
                  <div className="text-xs text-white/80 font-medium">Available</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filter Bar */}
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-white/30 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm focus:bg-white dark:focus:bg-slate-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none transition-all shadow-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                />
              </div>
              
             
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            
            {activeFolder !== null && !loading && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <FiFolder className="w-8 h-8 text-yellow-300 drop-shadow-md" />
                  <div>
                    <h2 className="text-xl font-bold text-white drop-shadow-md">
                      {activeFolder}
                    </h2>
                    <p className="text-xs text-white/80">
                      Showing {filteredFiles.length} of {files.filter(f => (f.folder || "General") === activeFolder).length} files
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {user?.role === "admin" && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 active:scale-95 border border-white/20 text-xs sm:text-sm cursor-pointer"
                    >
                      <FiFolder className="w-4 h-4" />
                      <span>Upload Files</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveFolder(null);
                      setSearchTerm("");
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-650 text-white font-bold rounded-xl shadow-md transition-all duration-200 active:scale-95 border border-white/20 text-xs sm:text-sm cursor-pointer"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span>Back to Folders</span>
                  </button>
                </div>
              </div>
            )}
            {loading ? (
              // Loading Skeleton
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border-2 border-white/30 dark:border-slate-800/40 p-6 animate-pulse shadow-lg ${
                    viewMode === "list" ? "flex items-center gap-6" : ""
                  }`}>
                    <div className={`${viewMode === "list" ? "w-16 h-16" : "w-full h-32"} bg-gray-200 dark:bg-slate-850 rounded-xl`}></div>
                    <div className={`${viewMode === "list" ? "flex-1" : "mt-4"} space-y-3`}>
                      <div className="h-4 bg-gray-200 dark:bg-slate-850 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-850 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error State
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl border-2 border-red-200 dark:border-red-900/30 p-12 text-center shadow-xl">
                <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
                <button 
                  onClick={fetchFiles}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Try Again
                </button>
              </div>
            ) : folders.length === 0 ? (
              // Empty State - No folders found
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl border-2 border-gray-200 dark:border-slate-800 p-16 text-center shadow-xl">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFolder className="w-12 h-12 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Folders Available</h3>
                <p className="text-gray-600 dark:text-slate-400">
                  {user?.role === "admin" 
                    ? "Create a new folder to organize your documents." 
                    : "No folders have been created yet. Please check back later."}
                </p>
                {user?.role === "admin" && (
                  <button
                    onClick={() => {
                      // Navigate to folder management or trigger folder creation
                      navigate("/folders");
                    }}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Create Folder
                  </button>
                )}
              </div>
            ) : activeFolder === null && searchTerm === "" ? (
              // Folders View
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-4`}>
                {folders.map((folder) => {
                  const folderName = folder.name;
                  const folderFiles = files.filter(f => (f.folder || "General") === folderName);
                  return (
                    <motion.button
                      key={folder._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.05, y: -4, rotate: [0, -0.5, 0.5, 0] }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveFolder(folderName)}
                      className={`group relative w-full ${
                        viewMode === "grid" 
                          ? "aspect-square" 
                          : "h-20"
                      } bg-gradient-to-br ${getFolderColor(folderName)} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex items-center justify-center p-4 border-2 border-white/30 hover:border-white/60 after:absolute after:inset-0 after:pointer-events-none after:bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2)_0%,_transparent_60%)] cursor-pointer`}
                    >
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-2.5">
                        {/* Folder Icon with glow */}
                        <div className="text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <FiFolder className="w-8 h-8 text-white" />
                        </div>
                        
                        {/* Folder Name - Dynamically displays the actual folder name */}
                        <span className="text-white font-bold text-base text-center line-clamp-2 px-1 leading-tight drop-shadow-lg">
                          {folderName}
                        </span>
 
                        {/* File count badge */}
                        <span className="text-xs font-bold text-white/80 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          {folderFiles.length} {folderFiles.length === 1 ? "file" : "files"}
                        </span>
                        
                        {/* Subtle arrow indicator on hover */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <FiArrowRight className="w-5 h-5 text-white/90 drop-shadow-lg" />
                        </div>
                      </div>
                      
                    </motion.button>
                  );
                })}
              </div>
            ) : filteredFiles.length === 0 ? (
              // Empty State for specific folder view or search view
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl border-2 border-gray-200 dark:border-slate-800 p-16 text-center shadow-xl w-full">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLock className="w-12 h-12 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Documents Found</h3>
                <p className="text-gray-600 dark:text-slate-400">
                  {searchTerm ? "No documents match your search criteria." : "No documents in this folder yet."}
                </p>
              </div>
            ) : (
              // Document Grid - Button Style with Impressive Colors
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-4`}>
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -4, rotate: [0, -1, 1, 0] }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/content/${file._id}`)}
                    className={`group relative w-full ${
                      viewMode === "grid" 
                        ? "aspect-square" 
                        : "h-20"
                    } bg-gradient-to-br ${getButtonColor(file.mimetype, file.originalName)} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex items-center justify-center p-4 border-2 border-white/30 hover:border-white/60 ${getCardPattern(file.mimetype, file.originalName)} after:absolute after:inset-0 after:pointer-events-none cursor-pointer`}
                  >
                    {/* Folder Badge Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFolder(file.folder || "General");
                      }}
                      className={`absolute ${
                        viewMode === "grid" 
                          ? "top-3 left-3" 
                          : "top-1/2 -translate-y-1/2 left-4"
                      } z-20 text-[10px] font-bold text-white bg-black/35 hover:bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1 shadow-sm`}
                    >
                      <FiFolder className="w-3 h-3 text-yellow-300" />
                      <span>{file.folder || "General"}</span>
                    </button>

                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-2.5">
                      {/* Icon with glow */}
                      <div className="text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {getFileIcon(file.mimetype, file.originalName)}
                      </div>
                      
                      {/* Title - Only on button */}
                      <span className="text-white font-bold text-sm text-center line-clamp-2 px-1 leading-tight drop-shadow-lg">
                        {file.title}
                      </span>
                      
                      {/* Subtle arrow indicator on hover */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <FiArrowRight className="w-5 h-5 text-white/90 drop-shadow-lg" />
                      </div>

                      {/* File type badge */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] font-bold text-white/80 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          {file.mimetype?.split('/')[0] || 'DOC'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-white/30 dark:border-slate-800/40 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 dark:text-slate-200">Zephyronz</span>
                <span>© {new Date().getFullYear()}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-gray-500 dark:text-slate-500">All Rights Reserved</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-950/30 px-3 py-1.5 rounded-full text-green-700 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Secure Vault
                </span>
                <span className="text-gray-400 dark:text-slate-500">v2.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* WhatsApp Floating Button - Positioned at Right Side Center */}
      <div className="fixed right-6 top-1/2 translate-y-70 z-[9999]  ">
        <div className="relative">
          {/* WhatsApp FAB Button */}
          <button
            onClick={() => setShowWhatsappForm(!showWhatsappForm)}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
              showWhatsappForm 
                ? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rotate-45" 
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            }`}
            aria-label="Contact Support"
          >
            {showWhatsappForm ? (
              <FiX className="w-7 h-7 text-white" />
            ) : (
              <FaWhatsapp className="w-8 h-8 text-white" />
            )}
          </button>

          {/* WhatsApp Form - Positioned in Left Upper Corner */}
          <AnimatePresence>
            {showWhatsappForm && (
              <motion.div
                initial={{ opacity: 0, x: -20, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, y: -20, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute bottom-full right-0 mb-4 w-80 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-slate-800"
                style={{ transformOrigin: "bottom right" }}
              >
                {/* Triangle pointer pointing to the button */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-gray-200 dark:border-slate-800 rotate-45"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaWhatsapp className="w-6 h-6 text-green-500" />
                    <span className="font-bold text-gray-800 dark:text-slate-200">Support</span>
                  </div>
                  <button
                    onClick={() => setShowWhatsappForm(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      rows="3"
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    {formSubmitting ? "Sending..." : "Send via WhatsApp"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Files Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800"
            >
              <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Upload Additional Files
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Folder: <span className="font-semibold text-indigo-500">{activeFolder}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-indigo-500/60 rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-slate-950/50 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer relative">
                    <input
                      ref={fileInputRef}
                      id="folderFileInput"
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
                    <label htmlFor="folderFileInput" className="cursor-pointer block">
                      <svg className="w-10 h-10 mx-auto text-gray-400 dark:text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-800 dark:text-slate-200 font-semibold text-sm">
                        Tap to browse files
                      </p>
                      <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">
                        PDFs, Images, Videos, Documents (Max 20MB per file)
                      </p>
                    </label>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Files Queue ({selectedFiles.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedFiles.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 dark:bg-slate-950 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800/80">
                          <div className="flex-1 min-w-0 w-full">
                            <p className="text-xs font-semibold text-gray-700 dark:text-slate-350 truncate">{item.file.name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{formatFileSize(item.file.size)}</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              value={item.title}
                              placeholder="Enter custom title"
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setSelectedFiles(prev => prev.map(f => f.id === item.id ? { ...f, title: newTitle } : f));
                              }}
                              className="flex-1 sm:w-36 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-slate-100"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== item.id))}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadLoading && (
                  <div className="w-full bg-gray-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFiles([]);
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-850 text-gray-700 dark:text-slate-350 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading || selectedFiles.length === 0}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadLoading ? "Uploading..." : "Upload Queue"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;