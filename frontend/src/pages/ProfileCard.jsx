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
  FiArrowLeft
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProfileCard = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password Reset Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1 = Send OTP, 2 = Enter OTP & Reset Password
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await response.json();
        setMessage({ type: "success", text: "Profile updated successfully!" });
        
        const updatedUser = { ...user, name: formData.name, email: formData.email };
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

  // Change Password Flow
  const handleSendOtp = async () => {
    setPasswordLoading(true);
    setPasswordError("");
    setTestOtpFallback(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password/reset`, {
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
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat bg-fixed transition-colors duration-300 flex flex-col pb-16 pt-12 px-4 sm:px-6 lg:px-8 text-slate-805"
      style={{ backgroundImage: `url('/campus_bg.jpg')` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/85 backdrop-blur-[2px] transition-colors duration-300"></div>

      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors font-semibold"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Profile Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile settings card */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-3xl overflow-hidden transition-colors duration-300">
            {/* Header Banner */}
            <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-purple-650 to-pink-600 flex justify-between items-start p-4">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border-4 border-white dark:border-slate-800">
                  <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              <div className="ml-auto w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden shadow-sm">
                <img 
                  src="/pwa-192x192.png" 
                  alt="Zephyronz Emblem" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-16 pb-8 px-8">
              {/* Edit Button */}
              {!isEditing && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 rounded-lg transition-colors font-semibold"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              )}

              {/* Success/Error Message */}
              {message.text && (
                <div className={`mb-6 p-3 rounded-lg text-sm font-semibold ${
                  message.type === "success" 
                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50" 
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                }`}>
                  {message.text}
                </div>
              )}

              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{user?.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${
                        user?.role === "admin" 
                          ? "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-900/50" 
                          : "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50"
                      }`}>
                        {user?.role === "admin" ? "Administrator" : "Member"}
                      </span>
                      {user?.isApproved ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-900/50">
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          Verified Account
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-805 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-900/50">
                          <FiClock className="w-3.5 h-3.5" />
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
                    <div className="flex items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-805 rounded-xl">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiMail className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email Address</p>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-805 rounded-xl">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiShield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">Role Category</p>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold capitalize">{user?.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-805 rounded-xl">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Access Permission</p>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">
                          {user?.isApproved ? "Full Access Granted" : "Pending Authorization"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-850 rounded-xl">
                      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Member Since</p>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{formatDate(user?.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={handleLogout}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-sm shadow-red-500/10"
                    >
                      <FiLogOut className="w-5 h-5" />
                      Logout Account
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                      required
                      disabled
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-455 mt-1.5 font-medium">Registered email cannot be modified</p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-650 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 font-bold shadow-md shadow-indigo-500/15"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-all font-bold"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column settings panels */}
          <div className="space-y-6">
            {/* Theme Card */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-3xl p-6 transition-colors duration-300">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg">Visual Customization</h3>
              
              <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center flex-shrink-0">
                    {theme === "dark" ? <FiMoon className="w-5 h-5 text-indigo-400" /> : <FiSun className="w-5 h-5 text-indigo-650" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-150">Application Theme</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Currently: {theme === "dark" ? "Dark" : "Light"}</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-indigo-600 dark:bg-slate-700"
                >
                  <span className="sr-only">Toggle theme</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Security settings card */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-3xl p-6 transition-colors duration-300">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg">System Security</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiShield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-150">Anti-Screenshot</p>
                      <p className="text-xs text-slate-500 dark:text-slate-405">Real-time guard blur</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    Shield Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiLock className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-150">Account Security</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Update password</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPasswordError("");
                      setPasswordStep(1);
                      setTestOtpFallback(null);
                      setShowPasswordModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg transition-colors font-bold text-xs shadow-sm shadow-indigo-600/15"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !passwordLoading && setShowPasswordModal(false)}
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-colors duration-300">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <FiLock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Update Password</h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {passwordSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-250">
                      <FiCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Password Updated Successfully!</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your account credentials have been updated.</p>
                  </div>
                ) : (
                  <>
                    {passwordError && (
                      <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
                        <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordStep === 1 ? (
                      // Step 1: Send OTP request
                      <div className="space-y-5 text-center">
                        <p className="text-sm text-slate-655 dark:text-slate-350">
                          To change your password, we need to send a 6-digit verification code (OTP) to your registered email: <strong>{user?.email}</strong>.
                        </p>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={passwordLoading}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl transition-all font-bold disabled:opacity-50 shadow-md shadow-indigo-500/10"
                        >
                          {passwordLoading ? "Generating Code..." : "Send Verification Code"}
                        </button>
                      </div>
                    ) : (
                      // Step 2: Input OTP and new passwords
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-indigo-805 dark:text-indigo-350 rounded-xl text-xs">
                          {otpSentMessage || "Verification code sent to email."}
                        </div>

                        {/* Local test fallback reminder */}
                        {testOtpFallback && (
                          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-250 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 rounded-xl text-xs space-y-1">
                            <p className="font-bold">⚠️ Local testing helper:</p>
                            <p>Email delivery is mocked. Please use the test verification code: <strong className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300/40 select-all font-mono text-sm">{testOtpFallback}</strong></p>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Verification Code (OTP) *
                          </label>
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit code"
                            value={passwordData.otp}
                            onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            New Password *
                          </label>
                          <input
                            type="password"
                            placeholder="Min 6 characters"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Confirm New Password *
                          </label>
                          <input
                            type="password"
                            placeholder="Re-enter password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>

                        <div className="flex gap-3 pt-3">
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-650 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 font-bold shadow-md shadow-indigo-500/15"
                          >
                            {passwordLoading ? "Updating..." : "Update Password"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPasswordStep(1)}
                            disabled={passwordLoading}
                            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-bold"
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