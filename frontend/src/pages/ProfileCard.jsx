import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  FiMail, 
  FiShield, 
  FiCalendar, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiCheckCircle,
  FiClock,
  FiUserCheck,
  FiLogOut,
  FiMoon,
  FiSun,
  FiLock,
  FiAlertTriangle,
  FiCheck,
  FiArrowLeft,
  FiPhone,
  FiUser,
  FiBriefcase,
  FiGlobe,
  FiBell,
  FiSettings,
  FiCreditCard,
  FiHelpCircle,
  FiShare2,
  FiMoreHorizontal
} from "react-icons/fi";
import { FaGraduationCap, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProfileCard = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordVerificationMethod, setPasswordVerificationMethod] = useState("email");

  // Password Reset Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [testOtpFallback, setTestOtpFallback] = useState(null);
  
  const [passwordData, setPasswordData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: "success", text: "Profile updated successfully!" });
        
        const updatedUser = { ...user, name: formData.name, email: formData.email, phone: data.user?.phone || formData.phone };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setTimeout(() => {
          setIsEditing(false);
          setMessage({ type: "", text: "" });
          window.location.reload();
        }, 1500);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSendOtp = async () => {
    setPasswordLoading(true);
    setPasswordError("");
    setTestOtpFallback(null);
    try {
      const response = await fetch(`${apiUrl}/api/users/change-password/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ method: passwordVerificationMethod })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOtpSentMessage(data.message);
        if (data.testOtp) {
          setTestOtpFallback(data.testOtp);
        }
        setPasswordStep(2);
      } else {
        throw new Error(data.message || "Failed to send verification code");
      }
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || "Failed to send verification code");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordData.otp.trim()) {
      setPasswordError("Please enter the verification code");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    try {
      const response = await fetch(`${apiUrl}/api/users/change-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          otp: passwordData.otp,
          newPassword: passwordData.newPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordStep(1);
          setPasswordData({ otp: "", newPassword: "", confirmPassword: "" });
          setPasswordSuccess(false);
          setTestOtpFallback(null);
        }, 2000);
      } else {
        throw new Error(data.message || "Password reset failed");
      }
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || "Password reset failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24 pt-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl ring-4 ring-white/50 dark:ring-slate-700/50">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                  <FiMail className="w-4 h-4" />
                  {user?.email}
                </span>
                <span className="w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  user?.role === "admin" 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  <FiShield className="w-3 h-3" />
                  {user?.role === "admin" ? "Administrator" : "Member"}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  user?.isApproved 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>
                  {user?.isApproved ? (
                    <><FiCheckCircle className="w-3 h-3" /> Verified</>
                  ) : (
                    <><FiClock className="w-3 h-3" /> Pending</>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Profile
              </button>
              <button className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-all">
                <FiMoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Details Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
              {message.text && (
                <div className={`mb-6 p-4 rounded-2xl text-sm font-semibold border transition-all ${
                  message.type === "success" 
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                }`}>
                  {message.text}
                </div>
              )}

              {!isEditing ? (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-blue-500" />
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{user?.name}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{user?.email}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{user?.phone || "Not registered"}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 capitalize">{user?.role}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member Since</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiEdit2 className="w-5 h-5 text-blue-500" />
                    Edit Profile
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Registered email cannot be modified.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            
          </div>

          {/* Right Column - Settings & Security */}
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiGlobe className="w-4 h-4 text-blue-500" />
                Appearance
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    {theme === "dark" ? 
                      <FiMoon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : 
                      <FiSun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Theme Mode</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === "dark" ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiShield className="w-4 h-4 text-purple-500" />
                Security
              </h3>
              
              <div className="mb-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40 text-indigo-750 dark:text-indigo-305 rounded-2xl text-xs font-semibold leading-relaxed">
                🛡️ Screenshots are not supported in this application for security reasons.
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <FiLock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Password</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last changed 2 months ago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPasswordError("");
                      setPasswordStep(1);
                      setTestOtpFallback(null);
                      setShowPasswordModal(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Update
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">2FA Status</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Not enabled</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-all">
                    Setup
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <FiLogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Logout</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of account</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <FaGraduationCap className="w-6 h-6" />
                <h3 className="font-bold">Account Status</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm opacity-80">Status</span>
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm opacity-80">Verified</span>
                  <span className="text-sm font-semibold">
                    {user?.isApproved ? "✅ Yes" : "⏳ Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Account Age</span>
                  <span className="text-sm font-semibold">
                    {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0} months
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !passwordLoading && setShowPasswordModal(false)}
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <FiLock className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Update Password</h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {passwordSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Password Updated!</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your password has been changed successfully.</p>
                  </div>
                ) : (
                  <>
                    {passwordError && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                        <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordStep === 1 ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                          Choose where you want to receive your verification code:
                        </p>
                        
                        <div className="flex gap-4">
                          <label className="flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-850 rounded-xl py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-900/40 transition">
                            <input
                              type="radio"
                              name="passwordVerificationMethod"
                              value="email"
                              checked={passwordVerificationMethod === "email"}
                              onChange={() => setPasswordVerificationMethod("email")}
                              className="accent-blue-500"
                            />
                            <span className="text-sm font-semibold text-gray-750 dark:text-gray-300">Email</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-855 rounded-xl py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-900/40 transition ${!user?.phone ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                              type="radio"
                              name="passwordVerificationMethod"
                              value="sms"
                              checked={passwordVerificationMethod === "sms"}
                              onChange={() => {
                                if (user?.phone) {
                                  setPasswordVerificationMethod("sms");
                                } else {
                                  toast.error("Please add a phone number to your profile first!");
                                }
                              }}
                              disabled={!user?.phone}
                              className="accent-blue-500"
                            />
                            <span className="text-sm font-semibold text-gray-750 dark:text-gray-300">SMS (Phone)</span>
                          </label>
                        </div>

                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 font-medium">
                          {passwordVerificationMethod === "sms" 
                            ? `SMS will be sent to: ${user?.phone}` 
                            : `Email will be sent to: ${user?.email}`
                          }
                        </p>

                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={passwordLoading}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                        >
                          {passwordLoading ? "Sending..." : "Send Verification Code"}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-400">
                          {otpSentMessage || "Verification code sent to your email."}
                        </div>

                        {testOtpFallback && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm">
                            <p className="font-semibold text-yellow-700 dark:text-yellow-400">Test Mode</p>
                            <p className="text-yellow-600 dark:text-yellow-500 text-xs mt-1">
                              Verification Code: <strong className="font-mono bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">{testOtpFallback}</strong>
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Verification Code *
                          </label>
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit code"
                            value={passwordData.otp}
                            onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono text-base tracking-widest text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            New Password *
                          </label>
                          <input
                            type="password"
                            placeholder="Min 6 characters"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            placeholder="Re-enter new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            required
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                          >
                            {passwordLoading ? "Updating..." : "Update Password"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPasswordStep(1)}
                            disabled={passwordLoading}
                            className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all"
                          >
                            Back
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;