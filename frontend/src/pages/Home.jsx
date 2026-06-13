/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FiFile,
  FiEye,
  FiUser,
  FiClock,
  FiCalendar,
  FiDownload,
  FiX,
  FiFileText,
  FiImage,
  FiAlertCircle,
  FiGrid,
  FiList,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiBookOpen,
  FiDatabase
} from "react-icons/fi";
import { FaFilePdf, FaRegFileAlt } from "react-icons/fa";
import { MdOutlineCloudUpload, MdOutlineDashboardCustomize } from "react-icons/md";
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
  const itemsPerPage = 9;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MdOutlineDashboardCustomize className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent">
                  Document Hub
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Secure document management system
                </p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm border border-white/50">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-indigo-100 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{files.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiOutlineDocumentText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-green-100 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">PDF Documents</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{getFileTypeCount("pdf")}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaFilePdf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-blue-100 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Images</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{getFileTypeCount("image")}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiImage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Storage Used</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {formatFileSize(files.reduce((acc, file) => acc + (file.size || 0), 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiDatabase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-4 mb-8 border border-white/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents by title or uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Type Filters */}
            <div className="flex gap-2">
              {["all", "pdf", "image", "document"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${
                    selectedType === type
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {type === "all" ? "All" : type}
                </button>
              ))}
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={fetchFiles}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiBookOpen className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-slate-500 font-medium">Loading your documents...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineDocumentText className="w-16 h-16 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No Documents Found
            </h3>
            <p className="text-slate-500">
              {searchTerm || selectedType !== "all" 
                ? "Try adjusting your search or filters" 
                : "No files have been uploaded by the admin yet"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedFiles.map((file) => (
              <div
                key={file._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-indigo-200 transform hover:-translate-y-1"
              >
                {/* Preview Area */}
                <div className="relative h-52 bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center overflow-hidden">
                  {file.pages && file.pages.length > 0 ? (
                    <img
                      src={getFileUrl(file.pages[0])}
                      alt={file.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      draggable="false"
                    />
                  ) : file.fileUrl && isImageFile(file.mimetype, file.originalName) ? (
                    <img
                      src={getFileUrl(file.fileUrl)}
                      alt={file.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      draggable="false"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      {getFileIcon(file.originalName || file.title, file.mimetype, "lg")}
                      <span className="mt-2 text-xs text-slate-400 font-medium uppercase">
                        {file.mimetype?.split('/').pop() || 'File'}
                      </span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  {file.pages && file.pages.length > 0 && (
                    <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {file.pages.length} {file.pages.length === 1 ? 'Page' : 'Pages'}
                    </span>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-slate-600">
                    {formatFileSize(file.size)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {file.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <FiUser className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="truncate">{file.uploadedBy?.name || "Admin"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <FiCalendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDate(file.createdAt)}</span>
                  </div>

                  <button
                    onClick={() => handleViewFile(file)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 font-medium shadow-md"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {paginatedFiles.map((file) => (
                <div
                  key={file._id}
                  className="p-5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.originalName || file.title, file.mimetype)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                          {file.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {file.uploadedBy?.name || "Admin"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(file.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiFile className="w-3 h-3" />
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewFile(file)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all transform hover:scale-105 font-medium shadow-md"
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
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
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
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
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
              className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Modal for Viewing Files */}
      {isModalOpen && selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 transition-opacity backdrop-blur-md"
            onClick={closeModal}
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                    {getFileIcon(selectedFile.originalName || selectedFile.title, selectedFile.mimetype)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800">
                      {selectedFile.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Uploaded by {selectedFile.uploadedBy?.name || "Admin"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeModal} 
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white/50 rounded-xl transition-all"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-slate-50">
                {selectedFile.pages && selectedFile.pages.length > 0 ? (
                  <div className="flex flex-col items-center gap-6">
                    {selectedFile.pages.map((pageFile, index) => (
                      <div 
                        key={index} 
                        className="relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl w-full"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <div 
                          className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-3"
                          style={{ opacity: 0.05 }}
                        >
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="flex items-center justify-center text-center font-bold text-slate-800 text-sm transform -rotate-[30deg]"
                            >
                              <div>
                                <p>{user?.name}</p>
                                <p className="text-xs">{user?.email}</p>
                                <p className="text-[10px]">{new Date().toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <img
                          src={getFileUrl(pageFile)}
                          alt={`Page ${index + 1}`}
                          className="w-full h-auto"
                          draggable="false"
                        />
                        <div className="mt-3 text-center text-xs text-slate-400 font-semibold border-t border-slate-100 pt-3">
                          Page {index + 1} of {selectedFile.pages.length}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isImageFile(selectedFile.mimetype, selectedFile.originalName) ? (
                  <div className="relative flex justify-center items-center min-h-[400px] bg-white rounded-2xl p-4" onContextMenu={(e) => e.preventDefault()}>
                    <div 
                      className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-3"
                      style={{ opacity: 0.05 }}
                    >
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center text-center font-bold text-slate-800 text-sm transform -rotate-[30deg]">
                          <div>
                            <p>{user?.name}</p>
                            <p className="text-xs">{user?.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <img
                      src={getFileUrl(selectedFile.fileUrl)}
                      alt={selectedFile.title}
                      className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg"
                      draggable="false"
                      onError={(e) => {
                        console.error("Image load error:", getFileUrl(selectedFile.fileUrl));
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : isPdfFile(selectedFile.mimetype, selectedFile.originalName) && selectedFile.fileUrl ? (
                  <div className="relative bg-white rounded-2xl overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
                    <div 
                      className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-3"
                      style={{ opacity: 0.05 }}
                    >
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center text-center font-bold text-slate-800 text-sm transform -rotate-[30deg]">
                          <div>
                            <p>{user?.name}</p>
                            <p className="text-xs">{user?.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <iframe
                      src={`${getFileUrl(selectedFile.fileUrl)}#toolbar=0`}
                      title={selectedFile.title}
                      className="w-full h-[70vh] rounded-xl relative z-0"
                      frameBorder="0"
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <div className="w-28 h-28 mx-auto mb-5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      {getFileIcon(selectedFile.originalName || selectedFile.title, selectedFile.mimetype, "lg")}
                    </div>
                    <h4 className="text-2xl font-bold text-slate-700 mb-3">
                      {selectedFile.title}
                    </h4>
                    <p className="text-slate-500 mb-2">
                      This file type cannot be previewed directly.
                    </p>
                    <p className="text-sm text-slate-400 mb-6">
                      File size: {formatFileSize(selectedFile.size)}
                    </p>
                    {user?.role === "admin" && selectedFile.fileUrl ? (
                      <div className="flex gap-3 justify-center">
                        <a
                          href={getFileUrl(selectedFile.fileUrl)}
                          download
                          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium shadow-md"
                        >
                          <FiDownload className="w-4 h-4" />
                          Download File
                        </a>
                        <a
                          href={getFileUrl(selectedFile.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-medium"
                        >
                          <FiEye className="w-4 h-4" />
                          Open in New Tab
                        </a>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 max-w-md mx-auto font-medium text-sm">
                        🔒 Downloads are disabled for security reasons
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-between items-center p-5 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FiUser className="w-4 h-4" />
                    <span>{selectedFile.uploadedBy?.name || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDate(selectedFile.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiFile className="w-4 h-4" />
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
                <button 
                  onClick={closeModal} 
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;