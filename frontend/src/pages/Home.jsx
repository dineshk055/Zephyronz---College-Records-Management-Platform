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
  const [viewMode, setViewMode] = useState("grid");

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
    if (mimetype?.includes('pdf') || extension === "pdf") return <FaFilePdf className="w-6 h-6 text-red-500" />;
    if (mimetype?.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return <FiImage className="w-6 h-6 text-green-500" />;
    if (mimetype?.startsWith('video') || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(extension)) return <FiVideo className="w-6 h-6 text-blue-500" />;
    return <FiFileText className="w-6 h-6 text-indigo-500" />;
  };

  // Get file color based on type
  const getFileColor = (mimetype, originalName) => {
    const extension = originalName?.split('.').pop()?.toLowerCase();
    if (mimetype?.includes('pdf') || extension === "pdf") return "border-red-200 dark:border-red-900/40 bg-red-50/95 dark:bg-red-950/20";
    if (mimetype?.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return "border-green-200 dark:border-green-900/40 bg-green-50/95 dark:bg-green-950/20";
    if (mimetype?.startsWith('video') || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(extension)) return "border-blue-200 dark:border-blue-900/40 bg-blue-50/95 dark:bg-blue-950/20";
    return "border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/95 dark:bg-indigo-950/20";
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
                      ? "bg-blue-500 text-white shadow-md" 
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === "list" 
                      ? "bg-blue-500 text-white shadow-md" 
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
            <div className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl flex items-center gap-3 text-xs text-white dark:text-indigo-305 font-semibold">
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
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
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
              // Document Grid/List
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                    className={`bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border-2 shadow-lg hover:shadow-2xl transition-all cursor-pointer group ${
                      viewMode === "list" 
                        ? "flex items-center gap-6 p-4" 
                        : "p-6 hover:border-blue-300"
                    } ${getFileColor(file.mimetype, file.originalName)}`}
                    onClick={() => navigate(`/content/${file._id}`)}
                  >
                    {/* Icon */}
                    <div className={`${
                      viewMode === "list" 
                        ? "w-20 h-20 flex-shrink-0" 
                        : "w-full h-40"
                    } rounded-xl flex items-center justify-center bg-white/80 dark:bg-slate-950/80 border-2 border-white dark:border-slate-800 shadow-inner`}>
                      <div className={`${viewMode === "list" ? "text-4xl" : "text-6xl"}`}>
                        {getFileIcon(file.mimetype, file.originalName)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`${viewMode === "list" ? "flex-1 min-w-0" : "mt-4"} space-y-2`}>
                      <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-600 dark:to-purple-650 text-white font-semibold rounded-xl text-sm shadow-md transition-all group-hover:from-blue-700 group-hover:to-indigo-700 max-w-full">
                        <span className="truncate">{file.title}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 truncate font-mono">
                        {file.originalName || "secure_document.pdf"}
                      </p>
                      {viewMode === "list" && (
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-gray-600 dark:text-slate-350">
                            {file.mimetype || "Document"}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-slate-500">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Arrow on hover */}
                    <div className={`${
                      viewMode === "list" ? "ml-4" : "mt-4"
                    } flex items-center justify-end text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <FiArrowRight className="w-5 h-5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>        {/* Footer */}
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
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
              ? "bg-gray-700 hover:bg-gray-800 rotate-45" 
              : "bg-green-500 hover:bg-green-600"
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