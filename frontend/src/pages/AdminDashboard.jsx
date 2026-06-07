import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { token, user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalUsers: 0,
    pendingApprovals: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch dashboard data
  useEffect(() => {
    if (token) {
      fetchFiles();
      fetchUsers();
    }
  }, [token]);

  const fetchFiles = async () => {
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
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(usersData);
      const pending = usersData.filter(u => !u.isApproved && u.role !== "admin").length;
      setStats(prev => ({ 
        ...prev, 
        totalUsers: usersData.length, 
        pendingApprovals: pending 
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

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
        const res = await axios.delete(`http://localhost:3000/api/files/${fileId}`, {
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

  // Get file URL
  const getFileUrl = (file) => {
    if (file.fileUrl) {
      let cleanPath = file.fileUrl.replace(/^\/?uploads\//, '');
      return `${import.meta.env.VITE_API_URL}/uploads/${cleanPath}`;
    }
    return null;
  };

  // Check if file is image
  const isImageFile = (file) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = file.fileUrl?.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  // File preview modal
  const FilePreviewModal = ({ file, onClose }) => {
    if (!file) return null;
    
    const fileUrl = getFileUrl(file);
    const isImage = isImageFile(file);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{file.title}</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {isImage && fileUrl ? (
              <img src={fileUrl} alt={file.title} className="w-full rounded-lg" />
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-600">Preview not available for this file type</p>
                {fileUrl && (
                  <a href={fileUrl} download className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Download File
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Stats Cards
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Files</p>
            <p className="text-3xl font-bold mt-2">{stats.totalFiles}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Total Users</p>
            <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Pending Approvals</p>
            <p className="text-3xl font-bold mt-2">{stats.pendingApprovals}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <StatsCards />

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: "upload", label: "Upload Files", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
              { id: "files", label: "Manage Files", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
              { id: "users", label: "Manage Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Upload New File</h2>
                <p className="text-purple-100 text-sm">Share documents with users</p>
              </div>
              
              <form onSubmit={handleUpload} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-all duration-200">
                    <input
                      id="fileInput"
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600">
                        {file ? file.name : "Click to browse or drag and drop"}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {file ? formatFileSize(file.size) : "Supports: PDF, Images, Documents (Max 10MB)"}
                      </p>
                    </label>
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}% uploaded</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
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
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Manage Files</h2>
              <p className="text-blue-100 text-sm">View, preview, and delete uploaded files</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No files uploaded yet
                      </td>
                    </tr>
                  ) : (
                    files.map((file) => (
                      <tr key={file._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{file.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {file.uploadedBy?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(file.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Preview"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file._id)}
                              className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Manage Users</h2>
              <p className="text-green-100 text-sm">Approve or remove user accounts</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {userItem.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            userItem.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            userItem.isApproved 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {userItem.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(userItem.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {!userItem.isApproved && userItem.role !== "admin" && (
                              <button
                                onClick={() => handleApproveUser(userItem._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-xs"
                              >
                                Approve
                              </button>
                            )}
                            {userItem.role !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(userItem._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs"
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
      </div>

      {/* File Preview Modal */}
      {showModal && (
        <FilePreviewModal file={selectedFile} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;