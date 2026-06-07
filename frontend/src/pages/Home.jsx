import { useEffect, useState } from "react";
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
  FiAlertCircle
} from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";
import { MdOutlineCloudUpload } from "react-icons/md";

const Home = () => {
  const { token, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // fetch files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get("http://localhost:3000/api/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setFiles(response.data.files || []);
      } else {
        setError("Failed to load files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError(error.response?.data?.msg || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getFileIcon = (fileName, mimetype) => {
    if (mimetype) {
      if (mimetype.includes('pdf')) return <FaFilePdf className="w-8 h-8 text-red-500" />;
      if (mimetype.includes('image')) return <FiImage className="w-8 h-8 text-green-500" />;
      if (mimetype.includes('word') || mimetype.includes('document')) return <FiFileText className="w-8 h-8 text-blue-500" />;
    }
    
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch(extension) {
      case 'pdf':
        return <FaFilePdf className="w-8 h-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FiImage className="w-8 h-8 text-green-500" />;
      case 'doc':
      case 'docx':
        return <FiFileText className="w-8 h-8 text-blue-500" />;
      default:
        return <FiFile className="w-8 h-8 text-purple-500" />;
    }
  };

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    return `http://localhost:3000/uploads/${fileUrl}`;
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                📚 Document Library
              </h1>
              <p className="text-gray-500 mt-1">
                View and access shared documents
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Documents</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {files.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <MdOutlineCloudUpload className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchFiles}
              className="ml-auto text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading documents...</p>
          </div>
        ) : files.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFile className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Documents Available
            </h3>
            <p className="text-gray-500">
              No files have been uploaded by the admin yet.
            </p>
          </div>
        ) : (
          // Files Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group transform hover:-translate-y-1"
              >
                {/* File Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {getFileIcon(file.originalName || file.title, file.mimetype)}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-semibold text-gray-800 line-clamp-1 text-lg">
                          {file.title}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                          {file.mimetype?.split('/').pop()?.toUpperCase() || 'FILE'} file
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Body */}
                <div className="p-4">
                  {/* Uploader Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <FiUser className="w-4 h-4 text-indigo-500" />
                    <span className="truncate">
                      Uploaded by: {file.uploadedBy?.name || "Admin"}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDate(file.createdAt)}</span>
                  </div>

                  {/* File Size */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <FiFile className="w-4 h-4" />
                    <span>{formatFileSize(file.size)}</span>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleViewFile(file)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal for Viewing Files */}
      {isModalOpen && selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {getFileIcon(selectedFile.originalName || selectedFile.title, selectedFile.mimetype)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedFile.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Uploaded by: {selectedFile.uploadedBy?.name || "Admin"}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50">
                {isImageFile(selectedFile.mimetype, selectedFile.originalName) ? (
                  <div className="flex justify-center items-center min-h-[400px] bg-white rounded-lg p-4">
                    <img
                      src={getFileUrl(selectedFile.fileUrl)}
                      alt={selectedFile.title}
                      className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error("Image load error:", getFileUrl(selectedFile.fileUrl));
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : isPdfFile(selectedFile.mimetype, selectedFile.originalName) ? (
                  <div className="bg-white rounded-lg overflow-hidden">
                    <iframe
                      src={`${getFileUrl(selectedFile.fileUrl)}#toolbar=1`}
                      title={selectedFile.title}
                      className="w-full h-[70vh] rounded-lg"
                      frameBorder="0"
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      {getFileIcon(selectedFile.originalName || selectedFile.title, selectedFile.mimetype)}
                    </div>
                    <h4 className="text-xl font-medium text-gray-700 mb-2">
                      {selectedFile.title}
                    </h4>
                    <p className="text-gray-500 mb-2">
                      This file type cannot be previewed directly.
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                      File size: {formatFileSize(selectedFile.size)}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <a
                        href={getFileUrl(selectedFile.fileUrl)}
                        download
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download File
                      </a>
                      <a
                        href={getFileUrl(selectedFile.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        <FiEye className="w-4 h-4" />
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiUser className="w-3 h-3" />
                    <span>{selectedFile.uploadedBy?.name || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    <span>{formatDate(selectedFile.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiFile className="w-3 h-3" />
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
                <button onClick={closeModal} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
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