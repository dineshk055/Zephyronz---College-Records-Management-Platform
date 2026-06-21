import { useState } from "react";
import { useAuth } from "../context/AuthContext";
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
  FiLogOut
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProfileCard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      // Update profile API call
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
        
        // Update local storage
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
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative pb-16 pt-12 px-4 sm:px-6 lg:px-8 text-slate-800"
      style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), url('/campus_bg.jpg')` }}
    >
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-650 hover:text-slate-800 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Profile Card */}
        <div className="backdrop-blur-xl bg-white/80 border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-650 via-purple-650 to-pink-600 flex justify-between items-start p-4">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white">
                <span className="text-4xl font-extrabold text-indigo-600">
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
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50/55 rounded-lg transition-colors font-semibold"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            )}

            {/* Success/Error Message */}
            {message.text && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === "success" 
                  ? "bg-green-55/10 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-750 border border-red-200"
              }`}>
                {message.text}
              </div>
            )}

            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{user?.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      user?.role === "admin" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-indigo-100 text-indigo-805"
                    }`}>
                      {user?.role === "admin" ? "Administrator" : "Member"}
                    </span>
                    {user?.isApproved ? (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        <FiCheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 font-semibold">
                        <FiClock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50/70 border border-slate-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                      <FiMail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Email Address</p>
                      <p className="text-slate-800 font-semibold">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50/70 border border-slate-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                      <FiShield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Account Type</p>
                      <p className="text-slate-800 font-semibold capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50/70 border border-slate-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                      <FiUserCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Account Status</p>
                      <p className="text-slate-800 font-semibold">
                        {user?.isApproved ? "Approved" : "Pending Approval"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50/70 border border-slate-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-amber-605" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Member Since</p>
                      <p className="text-slate-800 font-semibold">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 font-semibold">
                  <button
                    onClick={handleLogout}
                    className="w-full md:w-auto px-6 py-3 bg-red-650 hover:bg-red-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-sm shadow-red-500/10"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 cursor-not-allowed focus:outline-none"
                    required
                    disabled
                  />
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">Email cannot be changed</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-650 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 font-semibold shadow-md shadow-indigo-500/15"
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
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all font-semibold"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 backdrop-blur-xl bg-white/80 border border-slate-200/60 shadow-sm rounded-2xl p-6">
          <h3 className="font-bold text-slate-800 mb-3">Account Information</h3>
          <div className="space-y-2 text-sm text-slate-655 font-medium">
            <p>• You can update your profile information at any time</p>
            <p>• Your email address is used for login and cannot be changed</p>
            {user?.role === "admin" && (
              <p>• As an administrator, you have full access to manage users and files</p>
            )}
            {user?.role === "user" && user?.isApproved && (
              <p>• Your account has been verified and you have full access to documents</p>
            )}
            {!user?.isApproved && user?.role !== "admin" && (
              <p className="text-amber-600">• Your account is pending admin approval. You'll be notified once approved.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;