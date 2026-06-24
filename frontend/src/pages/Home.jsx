import { useEffect, useState, useCallback } from "react";
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
  FiGrid,
  FiList
} from "react-icons/fi";
import { FaFilePdf, FaWhatsapp, FaGraduationCap } from "react-icons/fa";
import homeBg from "../assets/home_bg.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { token, user, socket } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  // Floating WhatsApp Support Form State
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user?.name || "",
    message: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch files helper
  const fetchFiles = useCallback(async () => {
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

  // Initial load
  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token, fetchFiles]);

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

    return () => {
      socket.off("file-uploaded");
      socket.off("file-deleted");
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

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <FaGraduationCap className="text-yellow-300" />
                  Academic Vault
                </h1>
                <p className="text-white/90 text-sm md:text-base mt-1 drop-shadow-md font-medium">
                  Welcome back, {user?.name || "Student"}! Access your learning materials below.
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
              
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-1.5 border-2 border-white/30 dark:border-slate-800/40 shadow-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === "grid" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" 
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === "list" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" 
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/30 rounded-2xl flex items-center gap-3 text-xs text-white font-semibold">
              <span>🛡️ Security Alert: Screenshots and screen recording are disabled to protect document privacy.</span>
            </div>
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
            ) : filteredFiles.length === 0 ? (
              // Empty State
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl border-2 border-gray-200 dark:border-slate-800 p-16 text-center shadow-xl">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLock className="w-12 h-12 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Documents Found</h3>
                <p className="text-gray-600 dark:text-slate-400">
                  {searchTerm ? "No documents match your search criteria." : "No documents have been uploaded yet."}
                </p>
              </div>
            ) : (
              // Document Grid - Button Style with Impressive Colors
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-4`}>
                {filteredFiles.map((file) => (
                  <motion.button
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
                    } bg-gradient-to-br ${getButtonColor(file.mimetype, file.originalName)} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex items-center justify-center p-4 border-2 border-white/30 hover:border-white/60 ${getCardPattern(file.mimetype, file.originalName)} after:absolute after:inset-0 after:pointer-events-none`}
                  >
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
                  </motion.button>
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
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[9999]">
        <AnimatePresence>
          {showWhatsappForm && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 w-80 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="w-6 h-6 text-green-500" />
                  <span className="font-bold text-gray-800 dark:text-slate-200">Support</span>
                </div>
                <button
                  onClick={() => setShowWhatsappForm(false)}
                  className="p-1 hover:bg-gray-150 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
                    className="w-full bg-gray-50 dark:bg-slate-955 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
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
      </div>
    </div>
  );
};

export default Home;