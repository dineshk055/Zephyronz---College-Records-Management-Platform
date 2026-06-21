/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiFile,
  FiEye,
  FiUser,
  FiClock,
  FiCalendar,
  FiDownload,
  FiX,
  FiImage,
  FiAlertCircle,
  FiGrid,
  FiList,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiBookOpen,
  FiDatabase,
  FiHome,
  FiFolder,
  FiTrendingUp,
  FiUpload
} from "react-icons/fi";
import { FaFilePdf, FaRegFileAlt } from "react-icons/fa";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

const Home = () => {
  const { token, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [failedImages, setFailedImages] = useState({});
  const itemsPerPage = 9;

  const handleImageError = (fileId, index) => {
    setFailedImages(prev => ({
      ...prev,
      [`${fileId}-${index}`]: true
    }));
  };

  // fetch files
  const fetchFiles = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${apiUrl}/api/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setFiles(response.data.files || []);
        setFilteredFiles(response.data.files || []);
      } else {
        setError("Failed to load files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError(error.response?.data?.msg || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token, fetchFiles]);

  // Filter and search logic
  useEffect(() => {
    let result = [...files];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(file => 
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType !== "all") {
      result = result.filter(file => {
        if (selectedType === "pdf") return file.mimetype === "application/pdf";
        if (selectedType === "image") return file.mimetype?.startsWith("image/");
        if (selectedType === "document") return file.mimetype?.includes("word") || file.mimetype?.includes("document");
        return true;
      });
    }
    
    setFilteredFiles(result);
    setCurrentPage(1);
  }, [searchTerm, selectedType, files]);

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName, mimetype, size = "md") => {
    const sizeClasses = size === "lg" ? "w-12 h-12" : "w-8 h-8";
    
    if (mimetype) {
      if (mimetype.includes('pdf')) return <FaFilePdf className={`${sizeClasses} text-red-500`} />;
      if (mimetype.includes('image')) return <FiImage className={`${sizeClasses} text-green-500`} />;
      if (mimetype.includes('word') || mimetype.includes('document')) return <HiOutlineDocumentText className={`${sizeClasses} text-blue-500`} />;
    }
    
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch(extension) {
      case 'pdf':
        return <FaFilePdf className={`${sizeClasses} text-red-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FiImage className={`${sizeClasses} text-green-500`} />;
      case 'doc':
      case 'docx':
        return <HiOutlineDocumentText className={`${sizeClasses} text-blue-500`} />;
      default:
        return <FaRegFileAlt className={`${sizeClasses} text-purple-500`} />;
    }
  };

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    const cleanPath = fileUrl.replace(/^\/?uploads\//, '');
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${apiUrl}/uploads/${cleanPath}`;
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
    localStorage.setItem("active_document", JSON.stringify({ id: file._id, title: file.title }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    localStorage.removeItem("active_document");
  };

  const isImageFile = (mimetype, fileName) => {
    if (mimetype) return mimetype.startsWith('image/');
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = fileName?.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const isPdfFile = (mimetype, fileName) => {
    if (mimetype) return mimetype === 'application/pdf';
    return fileName?.split('.').pop()?.toLowerCase() === 'pdf';
  };

  const getFileTypeCount = (type) => {
    if (type === "all") return files.length;
    if (type === "pdf") return files.filter(f => f.mimetype === "application/pdf").length;
    if (type === "image") return files.filter(f => f.mimetype?.startsWith("image/")).length;
    if (type === "document") return files.filter(f => f.mimetype?.includes("word") || f.mimetype?.includes("document")).length;
    return 0;
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat transition-colors duration-300 flex flex-col"
      style={{ backgroundImage: `url('/campus_bg.jpg')` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/85 backdrop-blur-[2px] transition-colors duration-300"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Header - Clean and Minimal */}
        <header className="bg-white/85 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-20 shadow-sm backdrop-blur-md transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 transition-all duration-300">
                  <img 
                    src="/pwa-192x192.png" 
                    alt="Zephyronz Emblem" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Document Hub</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Secure Document Management</p>
                </div>
              </div>
              
              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-350">
                    <FiUser className="w-4 h-4 text-slate-400 dark:text-slate-550" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Here's an overview of your documents</p>
          </div>

          {/* Stats Cards - Modern Design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-5 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Documents</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{files.length}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center">
                  <HiOutlineDocumentText className="w-5 h-5 text-indigo-600 dark:text-indigo-405" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-5 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">PDF Files</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{getFileTypeCount("pdf")}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 dark:bg-red-950/40 rounded-lg flex items-center justify-center">
                  <FaFilePdf className="w-5 h-5 text-red-500 dark:text-red-405" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-5 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Images</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{getFileTypeCount("image")}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 dark:bg-green-950/40 rounded-lg flex items-center justify-center">
                  <FiImage className="w-5 h-5 text-green-500 dark:text-green-405" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-5 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Storage Used</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {formatFileSize(files.reduce((acc, file) => acc + (file.size || 0), 0))}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/40 rounded-lg flex items-center justify-center">
                  <FiDatabase className="w-5 h-5 text-purple-500 dark:text-purple-405" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters - Clean Design */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-550 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-950/55 border border-slate-200/80 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {["all", "pdf", "image", "document"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                      selectedType === type
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {type === "all" ? "All" : type}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" 
                      ? "bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" 
                      ? "bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 flex-1 text-sm">{error}</p>
              <button
                onClick={fetchFiles}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium">Loading documents...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/50">
              <div className="w-20 h-20 bg-slate-105 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineDocumentText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No Documents Found</h3>
              <p className="text-sm text-slate-550 dark:text-slate-455">
                {searchTerm || selectedType !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No files have been uploaded yet"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedFiles.map((file) => (
                <div
                  key={file._id}
                  className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200/50 dark:border-slate-800/50"
                >
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                    {file.pagesData && file.pagesData.length > 0 ? (
                      <img
                        src={file.pagesData[0]}
                        alt={file.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        draggable="false"
                      />
                    ) : file.pages && file.pages.length > 0 && !failedImages[`${file._id}-0`] ? (
                      <img
                        src={getFileUrl(file.pages[0])}
                        alt={file.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        draggable="false"
                        onError={() => handleImageError(file._id, 0)}
                      />
                    ) : file.fileUrl && isImageFile(file.mimetype, file.originalName) && !failedImages[`${file._id}-0`] ? (
                      <img
                        src={getFileUrl(file.fileUrl)}
                        alt={file.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        draggable="false"
                        onError={() => handleImageError(file._id, 0)}
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-2">
                          {getFileIcon(file.originalName || file.title, file.mimetype, "md")}
                        </div>
                        <span className="text-xs text-slate-550 dark:text-slate-400 font-medium uppercase tracking-wider">
                          {failedImages[`${file._id}-0`] ? 'Content Missing' : (file.mimetype?.split('/').pop() || 'File')}
                        </span>
                      </div>
                    )}
                    
                    {((file.pagesData && file.pagesData.length > 0) || (file.pages && file.pages.length > 0)) && (
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-lg">
                        {file.pagesData && file.pagesData.length > 0 ? file.pagesData.length : file.pages.length} pages
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-1 line-clamp-1">
                      {file.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-450 mb-3">
                      <FiUser className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{file.uploadedBy?.name || "Admin"}</span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                      <FiCalendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{formatDate(file.createdAt)}</span>
                    </div>

                    <button
                      onClick={() => handleViewFile(file)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>View Document</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedFiles.map((file) => (
                  <div
                    key={file._id}
                    className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.originalName || file.title, file.mimetype)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors truncate text-sm">
                            {file.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-450 mt-0.5">
                            <span>{file.uploadedBy?.name || "Admin"}</span>
                            <span>{formatDate(file.createdAt)}</span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewFile(file)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <FiChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg font-medium text-sm transition-all shadow-sm ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <FiChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          )}
        </main>

        {/* Modal for Viewing Files */}
        {isModalOpen && selectedFile && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            ></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-55/60 dark:bg-slate-950/40">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-white dark:bg-slate-950 rounded-lg flex items-center justify-center shadow-sm border border-slate-200/50 dark:border-slate-800">
                      {getFileIcon(selectedFile.originalName || selectedFile.title, selectedFile.mimetype)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {selectedFile.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        Uploaded by {selectedFile.uploadedBy?.name || "Admin"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={closeModal} 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-slate-50 dark:bg-slate-950">
                  {selectedFile.pagesData && selectedFile.pagesData.length > 0 ? (
                    <div className="flex flex-col items-center gap-6">
                      {selectedFile.pagesData.map((pageData, index) => (
                        <div 
                          key={index} 
                          className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden max-w-4xl w-full"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <img
                            src={pageData}
                            alt={`Page ${index + 1}`}
                            className="w-full h-auto"
                            draggable="false"
                          />
                          <div className="text-center text-xs text-slate-400 dark:text-slate-505 font-medium border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 px-4 pb-2">
                            Page {index + 1} of {selectedFile.pagesData.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedFile.pages && selectedFile.pages.length > 0 ? (
                    <div className="flex flex-col items-center gap-6">
                      {selectedFile.pages.map((pageFile, index) => (
                        <div 
                          key={index} 
                          className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden max-w-4xl w-full"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          {failedImages[`${selectedFile._id}-${index}`] ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-slate-55 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-center">
                              <FiAlertCircle className="w-8 h-8 text-amber-505 mb-2" />
                              <p className="font-medium text-sm">Page {index + 1} Content Missing</p>
                            </div>
                          ) : (
                            <img
                              src={getFileUrl(pageFile)}
                              alt={`Page ${index + 1}`}
                              className="w-full h-auto"
                              draggable="false"
                              onError={() => handleImageError(selectedFile._id, index)}
                            />
                          )}
                          <div className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 px-4 pb-2">
                            Page {index + 1} of {selectedFile.pages.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isImageFile(selectedFile.mimetype, selectedFile.originalName) ? (
                    <div className="flex justify-center items-center min-h-[400px] bg-white dark:bg-slate-900 rounded-xl p-4" onContextMenu={(e) => e.preventDefault()}>
                      {failedImages[`${selectedFile._id}-0`] ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400 text-center">
                          <FiAlertCircle className="w-10 h-10 text-amber-500 mb-3" />
                          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Image Unavailable</h4>
                          <p className="text-sm text-slate-400 dark:text-slate-500">The file has been deleted or is unavailable</p>
                        </div>
                      ) : (
                        <img
                          src={getFileUrl(selectedFile.fileUrl)}
                          alt={selectedFile.title}
                          className="max-w-full max-h-[60vh] object-contain rounded-lg"
                          draggable="false"
                          onError={() => handleImageError(selectedFile._id, 0)}
                        />
                      )}
                    </div>
                  ) : isPdfFile(selectedFile.mimetype, selectedFile.originalName) && selectedFile.fileUrl ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner" onContextMenu={(e) => e.preventDefault()}>
                      <iframe
                        src={`${getFileUrl(selectedFile.fileUrl)}#toolbar=0`}
                        title={selectedFile.title}
                        className="w-full h-[70vh] rounded-xl"
                        frameBorder="0"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl">
                      <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-950 rounded-full flex items-center justify-center">
                        {getFileIcon(selectedFile.originalName || selectedFile.title, selectedFile.mimetype, "lg")}
                      </div>
                      <h4 className="text-xl font-semibold text-slate-705 dark:text-slate-200 mb-2">
                        {selectedFile.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                        This file type cannot be previewed directly.
                      </p>
                      {user?.role === "admin" && selectedFile.fileUrl ? (
                        <a
                          href={getFileUrl(selectedFile.fileUrl)}
                          download
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          <FiDownload className="w-4 h-4" />
                          Download File
                        </a>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-250 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 rounded-lg p-3 max-w-md mx-auto text-sm font-medium">
                          🔒 Downloads are disabled
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Modal Footer */}
                <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-4 text-sm text-slate-550 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FiUser className="w-4 h-4" />
                      <span>{selectedFile.uploadedBy?.name || "Admin"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiClock className="w-4 h-4" />
                      <span>{formatDate(selectedFile.createdAt)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={closeModal} 
                    className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-white/85 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 py-8 backdrop-blur-md transition-colors duration-300 mt-auto w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <p>&copy; {new Date().getFullYear()} Zephyronz. All rights reserved.</p>
              <div className="flex gap-6 font-medium">
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Terms</a>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;