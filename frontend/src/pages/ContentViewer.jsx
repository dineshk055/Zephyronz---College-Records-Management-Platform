import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  FiChevronLeft, 
  FiFileText, 
  FiImage, 
  FiVideo, 
  FiAlertTriangle, 
  FiDownload, 
  FiClock, 
  FiUser
} from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";

const ContentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [textData, setTextData] = useState("");
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (index) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  };

  const getFileUrl = (url) => {
    if (!url) return "";
    const cleanPath = url.replace(/^\/?uploads\//, '');
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${apiUrl}/uploads/${cleanPath}`;
  };

  useEffect(() => {
    const fetchFileDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const res = await axios.get(`${apiUrl}/api/files/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const fileData = res.data.file;
          setFile(fileData);
          
          // Set active document for ScreenshotGuard
          localStorage.setItem("active_document", JSON.stringify({ 
            id: fileData._id, 
            title: fileData.title 
          }));

          // If it's a text/csv file, fetch the content to display
          const extension = fileData.originalName?.split('.').pop()?.toLowerCase();
          if (['txt', 'csv'].includes(extension) || fileData.mimetype?.startsWith("text/")) {
            try {
              const fileUrl = getFileUrl(fileData.fileUrl);
              const textRes = await fetch(fileUrl);
              const text = await textRes.text();
              setTextData(text);
            } catch (err) {
              console.error("Error reading text content:", err);
            }
          }
        } else {
          setError("Failed to load file details.");
        }
      } catch (err) {
        console.error("Error fetching file details:", err);
        setError(err.response?.data?.msg || "Failed to load file details.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchFileDetail();
    }

    return () => {
      localStorage.removeItem("active_document");
    };
  }, [id, token]);

  const isImageFile = (mimetype, originalName) => {
    if (mimetype) return mimetype.startsWith('image/');
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const extension = originalName?.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const isVideoFile = (mimetype, originalName) => {
    if (mimetype) return mimetype.startsWith('video/');
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'];
    const extension = originalName?.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(extension);
  };

  const isOfficeDoc = (mimetype, originalName) => {
    const docExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const extension = originalName?.split('.').pop()?.toLowerCase();
    return docExtensions.includes(extension) || mimetype?.includes("document") || mimetype?.includes("sheet") || mimetype?.includes("presentation");
  };

  const isPdfFile = (mimetype, originalName) => {
    if (mimetype) return mimetype === 'application/pdf';
    return originalName?.split('.').pop()?.toLowerCase() === 'pdf';
  };

  const getFileIcon = () => {
    if (!file) return null;
    const name = file.originalName || file.title;
    const mime = file.mimetype;
    if (mime?.includes('pdf') || name.endsWith('.pdf')) return <FaFilePdf className="w-8 h-8 text-red-500" />;
    if (mime?.startsWith('image') || isImageFile(mime, name)) return <FiImage className="w-8 h-8 text-green-400" />;
    if (mime?.startsWith('video') || isVideoFile(mime, name)) return <FiVideo className="w-8 h-8 text-blue-400" />;
    return <FiFileText className="w-8 h-8 text-purple-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-blue-500"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">Decrypting secure files...</p>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-white px-4 transition-colors duration-300">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
          <FiAlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Access Denied or Error</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">{error || "File could not be found."}</p>
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold shadow-md"
        >
          <FiChevronLeft className="w-5 h-5" />
          <span>Back to Hub</span>
        </button>
      </div>
    );
  }

  const fileUrl = getFileUrl(file.fileUrl);
  const isLocalhost = fileUrl.includes("localhost") || fileUrl.includes("127.0.0.1");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-205 dark:border-slate-800/60 px-4 py-4 md:px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-800"
              aria-label="Back"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              {getFileIcon()}
              <div>
                <h1 className="text-base md:text-lg font-bold truncate max-w-[200px] md:max-w-md">
                  {file.title}
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <FiUser className="w-3 h-3" /> {file.uploadedBy?.name || "Admin"}
                  </span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" /> {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
       

        <div className="w-full flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-4 md:p-8 min-h-[50vh] backdrop-blur-md overflow-hidden relative shadow-sm dark:shadow-none transition-colors duration-300">
          
          {/* 1. PDF / Images rendered as converted base64 page slides */}
          {file.pagesData && file.pagesData.length > 0 ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-3xl" onContextMenu={e => e.preventDefault()}>
              {file.pagesData.map((pageData, index) => (
                <div 
                  key={index} 
                  className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg dark:shadow-2xl w-full"
                >
                  <img
                    src={pageData}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto object-contain max-h-[80vh]"
                    draggable="false"
                  />
                  <div className="text-center text-xs text-slate-550 dark:text-slate-400 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850">
                    Page {index + 1} of {file.pagesData.length}
                  </div>
                </div>
              ))}
            </div>
          ) : file.pages && file.pages.length > 0 ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-3xl" onContextMenu={e => e.preventDefault()}>
              {file.pages.map((pageFile, index) => (
                <div 
                  key={index} 
                  className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg dark:shadow-2xl w-full"
                >
                  {failedImages[index] ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-550 text-center">
                      <FiAlertTriangle className="w-10 h-10 text-amber-550 mb-2" />
                      <p className="font-semibold text-sm">Page {index + 1} Content Unreachable</p>
                    </div>
                  ) : (
                    <img
                      src={getFileUrl(pageFile)}
                      alt={`Page ${index + 1}`}
                      className="w-full h-auto object-contain max-h-[80vh]"
                      draggable="false"
                      onError={() => handleImageError(index)}
                    />
                  )}
                  <div className="text-center text-xs text-slate-550 dark:text-slate-400 py-3 bg-slate-50 dark:bg-slate-955 border-t border-slate-100 dark:border-slate-850">
                    Page {index + 1} of {file.pages.length}
                  </div>
                </div>
              ))}
            </div>
          ) 
          
          /* 2. Image Native View */
          : isImageFile(file.mimetype, file.originalName) ? (
            <div className="flex justify-center items-center w-full max-w-3xl" onContextMenu={e => e.preventDefault()}>
              {failedImages[0] ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                  <FiAlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                  <p className="font-medium">Image content could not be loaded</p>
                </div>
              ) : (
                <img
                  src={fileUrl}
                  alt={file.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
                  draggable="false"
                  onError={() => handleImageError(0)}
                />
              )}
            </div>
          ) 

          /* 3. HTML5 Video Player */
          : isVideoFile(file.mimetype, file.originalName) ? (
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-850 bg-black shadow-2xl">
              <video
                src={fileUrl}
                controls
                controlsList="nodownload"
                className="w-full h-auto max-h-[70vh] object-contain"
                onContextMenu={e => e.preventDefault()}
              >
                Your browser does not support video streaming.
              </video>
            </div>
          ) 

          /* 4. Text/CSV File Reader */
          : (file.mimetype?.startsWith("text/") || ['txt', 'csv'].includes(file.originalName?.split('.').pop()?.toLowerCase())) ? (
            <div className="w-full max-w-4xl bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 md:p-6 shadow-inner font-mono text-left overflow-x-auto max-h-[70vh] no-scrollbar">
              <pre className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre">
                {textData || "Loading text contents..."}
              </pre>
            </div>
          ) 

          /* 5. Office Document Embeds (Word, Excel, PowerPoint) */
          : isOfficeDoc(file.mimetype, file.originalName) ? (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center">
              {isLocalhost ? (
                // Local development helper (since MS Office online cannot fetch local addresses)
                <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-lg dark:shadow-2xl">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <FiFileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">Office Document</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                    This document (<strong>{file.originalName}</strong>) is stored locally. In production, it will render automatically inside our secure MS Office Web viewer.
                  </p>
                  {user?.role === "admin" ? (
                    <a
                      href={fileUrl}
                      download
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md"
                    >
                      <FiDownload className="w-4.5 h-4.5" />
                      <span>Download Offline copy</span>
                    </a>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-500 bg-amber-500/5 border border-amber-500/15 py-2 px-4 rounded-xl font-medium">
                      🔒 Downloads are disabled for student accounts.
                    </div>
                  )}
                </div>
              ) : (
                // Production Microsoft Office viewer
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                  title={file.title}
                  className="w-full h-full rounded-2xl border border-slate-800 shadow-2xl"
                  frameBorder="0"
                ></iframe>
              )}
            </div>
          ) 

          /* 6. Raw PDF Native View fallback */
          : isPdfFile(file.mimetype, file.originalName) ? (
            <div className="w-full h-[70vh]">
              <iframe
                src={`${fileUrl}#toolbar=0`}
                title={file.title}
                className="w-full h-full rounded-2xl border border-slate-800 shadow-2xl"
                frameBorder="0"
                onContextMenu={e => e.preventDefault()}
              ></iframe>
            </div>
          ) 

          /* 7. General Fallback */
          : (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-lg dark:shadow-2xl">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                <FiFileText className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">Unsupported Preview</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                Previewing files of type <strong>{file.mimetype || "unknown"}</strong> is not supported online.
              </p>
              {user?.role === "admin" ? (
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md"
                >
                  <FiDownload className="w-4.5 h-4.5" />
                  <span>Download File</span>
                </a>
              ) : (
                <div className="text-xs text-amber-605 dark:text-amber-500 bg-amber-500/5 border border-amber-500/15 py-2 px-4 rounded-xl font-medium">
                  🔒 Download restricted. Please contact admin.
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ContentViewer;
