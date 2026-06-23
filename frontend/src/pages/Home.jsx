import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiFileText,
  FiVideo,
  FiImage,
  FiGrid,
  FiList,
  FiUser,
  FiCalendar,
  FiSend,
  FiInfo,
  FiDatabase,
  FiActivity,
  FiTrendingUp,
  FiLayers,
  FiAlertCircle
} from "react-icons/fi";
import { FaFilePdf, FaWhatsapp } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";

const Home = () => {
  const navigate = useNavigate();
  const { token, user, socket } = useAuth();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
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
          background: "#1E293B",
          color: "#FFF",
          border: "1px solid rgba(37, 99, 235, 0.2)"
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

  // Form handling
  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, message } = contactForm;

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      toast.error("Please fill out all contact fields.");
      return;
    }

    if (!/^\+?[0-9\s-]{10,15}$/.test(phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setFormSubmitting(true);
    
    // Construct pre-filled WhatsApp message
    const formattedText = 
      `*ZEPHYRONZ INQUIRY*\n` +
      `---------------------------\n` +
      `*Name:* ${name}\n` +
      `*Email:* ${email}\n` +
      `*Phone:* ${phone}\n` +
      `*Message:* ${message}`;

    const adminWhatsAppNumber = "916369679025"; // Format: country code + number without plus
    const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(formattedText)}`;

    // Trigger WhatsApp redirect
    setTimeout(() => {
      setFormSubmitting(false);
      toast.success("Redirecting to WhatsApp support...");
      window.open(whatsappUrl, "_blank");
      
      // Reset message field
      setContactForm(prev => ({ ...prev, message: "" }));
    }, 800);
  };

  const handleQuickSupportClick = () => {
    const defaultText = "Hello Admin, I need instant support with my Zephyronz college records account.";
    window.open(`https://wa.me/916369679025?text=${encodeURIComponent(defaultText)}`, "_blank");
  };

  // Filter Logic
  const getFilteredFiles = () => {
    return files.filter(file => {
      const matchSearch = 
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchSearch) return false;

      const extension = file.originalName?.split('.').pop()?.toLowerCase();
      if (selectedType === "all") return true;
      if (selectedType === "pdf") return file.mimetype === "application/pdf" || extension === "pdf";
      if (selectedType === "image") return file.mimetype?.startsWith("image/") || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
      if (selectedType === "video") return file.mimetype?.startsWith("video/") || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(extension);
      if (selectedType === "document") return file.mimetype?.includes("document") || file.mimetype?.includes("sheet") || file.mimetype?.includes("presentation") || ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(extension);
      
      return true;
    });
  };

  const filteredList = getFilteredFiles();

  const getFileIcon = (mimetype, originalName) => {
    const extension = originalName?.split('.').pop()?.toLowerCase();
    if (mimetype?.includes('pdf') || extension === "pdf") return <FaFilePdf className="w-5 h-5 text-red-500" />;
    if (mimetype?.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return <FiImage className="w-5 h-5 text-green-400" />;
    if (mimetype?.startsWith('video') || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(extension)) return <FiVideo className="w-5 h-5 text-blue-400" />;
    return <FiFileText className="w-5 h-5 text-cyan-400" />;
  };

  const getFormatName = (mimetype, originalName) => {
    const extension = originalName?.split('.').pop()?.toUpperCase() || "RECORD";
    return extension;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 relative">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 py-6 relative z-10 space-y-8">
        
        {/* Welcome Dashboard Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900/40 to-slate-900/60 p-6 rounded-3xl border border-blue-900/20 shadow-2xl backdrop-blur-md">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Member'}</span> 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Access and manage your secured credentials and academic logs.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-650/10 flex items-center justify-center border border-blue-500/25">
              <FiDatabase className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vault Files</p>
              <p className="text-base font-bold text-slate-100">{files.length} Secure Logs</p>
            </div>
          </div>
        </div>

        {/* Quick actions slider */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <FiActivity className="w-3.5 h-3.5 text-blue-500" />
            <span>Vault Quick Actions</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setSelectedType("all")} 
              className={`p-4 rounded-2xl border text-left transition-all group ${
                selectedType === "all" ? "bg-blue-600/10 border-blue-500/50" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <FiLayers className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold">All Folders</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Browse all categories</p>
            </button>
            <button 
              onClick={() => setSelectedType("pdf")} 
              className={`p-4 rounded-2xl border text-left transition-all group ${
                selectedType === "pdf" ? "bg-blue-600/10 border-blue-500/50" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <FaFilePdf className="w-6 h-6 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold">PDF Records</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Documents & forms</p>
            </button>
            <button 
              onClick={() => setSelectedType("video")} 
              className={`p-4 rounded-2xl border text-left transition-all group ${
                selectedType === "video" ? "bg-blue-600/10 border-blue-500/50" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <FiVideo className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold">Lectures & Media</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Stream uploaded video files</p>
            </button>
            <button 
              onClick={() => setSelectedType("document")} 
              className={`p-4 rounded-2xl border text-left transition-all group ${
                selectedType === "document" ? "bg-blue-600/10 border-blue-500/50" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <HiOutlineDocumentText className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold">Office Sheets</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Word, Excel, Text logs</p>
            </button>
          </div>
        </div>

        {/* Live Search and Display filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 shadow-md">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search records or uploaders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/75 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-200 placeholder-slate-500 transition-all"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" 
                    ? "bg-slate-800 text-blue-400 shadow-inner" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
                title="Grid view"
              >
                <FiGrid className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" 
                    ? "bg-slate-800 text-blue-400 shadow-inner" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
                title="List view"
              >
                <FiList className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Records Catalog */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FiTrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Available Documents & CMS</span>
            </h3>
            <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded-full border border-slate-800 text-slate-400">
              {filteredList.length} items
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl skeleton-loader border border-slate-850"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-center text-red-400 text-sm flex flex-col items-center gap-3">
              <FiAlertCircle className="w-8 h-8 text-red-500" />
              <p>{error}</p>
              <button 
                onClick={fetchFiles}
                className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-850 p-8">
              <HiOutlineDocumentText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-350">No secure files found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No record matches your search. Try adjusting filters or search string.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((file) => (
                <motion.div
                  layoutId={`file-${file._id}`}
                  key={file._id}
                  onClick={() => navigate(`/content/${file._id}`)}
                  className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-850 hover:border-blue-500/25 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  whileHover={{ y: -4 }}
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-md">
                        {getFileIcon(file.mimetype, file.originalName)}
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-850 text-slate-400 uppercase tracking-widest border border-slate-800">
                        {getFormatName(file.mimetype, file.originalName)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-100 group-hover:text-blue-400 transition-colors text-sm line-clamp-1">
                        {file.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {file.originalName || "secure_record.bin"}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-850/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <FiUser className="w-3 h-3 text-slate-550" />
                      <span className="max-w-[80px] truncate">{file.uploadedBy?.name || "Admin"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="w-3 h-3 text-slate-550" />
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="font-semibold text-slate-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-slate-900/40 rounded-2xl border border-slate-850 overflow-hidden divide-y divide-slate-850/80 shadow-lg">
              {filteredList.map((file) => (
                <div
                  key={file._id}
                  onClick={() => navigate(`/content/${file._id}`)}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-slate-900/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 flex-shrink-0">
                      {getFileIcon(file.mimetype, file.originalName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm truncate">
                        {file.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-mono">{file.originalName}</span>
                        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                        <span>{file.uploadedBy?.name || "Admin"}</span>
                        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-1 rounded bg-slate-850 text-slate-400 border border-slate-800 uppercase tracking-widest flex-shrink-0">
                    View
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Admin Form Section */}
        <div className="bg-slate-900/60 border border-slate-850 shadow-2xl rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-1.5">
              <div className="inline-flex w-12 h-12 bg-green-500/10 rounded-2xl items-center justify-center border border-green-500/20 text-green-400 mb-2">
                <FaWhatsapp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Contact College Records Admin</h3>
              <p className="text-xs text-slate-400">
                Submit an inquiry. This form routes your message directly to the administrator's WhatsApp.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="student@college.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Write your request details here..."
                  rows="4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <FaWhatsapp className="w-4.5 h-4.5" />
                <span>{formSubmitting ? "Routing..." : "Submit Inquiry to WhatsApp"}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Floating Action Button (FAB) for WhatsApp Direct Chat */}
      <button
        onClick={handleQuickSupportClick}
        className="fixed bottom-28 md:bottom-8 right-6 z-40 bg-green-600 hover:bg-green-500 hover:scale-105 active:scale-95 text-white w-14 h-14 rounded-full shadow-[0_6px_24px_rgba(22,163,74,0.45)] flex items-center justify-center transition-all duration-300 group border border-green-500/35 hover:shadow-[0_8px_32px_rgba(22,163,74,0.55)]"
        title="Chat with Admin on WhatsApp"
        aria-label="Direct Support Chat"
      >
        <FaWhatsapp className="w-7 h-7 animate-pulse" />
      </button>
    </div>
  );
};

export default Home;