import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiCalendar, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiCheckCircle,
  FiClock,
  FiUserCheck,
  FiLock,
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
        const data = await response.json();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-4xl font-bold text-gray-700">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-8">
            {/* Edit Button */}
            {!isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {message.text}
              </div>
            )}

            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user?.role === "admin" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user?.role === "admin" ? "Administrator" : "Member"}
                    </span>
                    {user?.isApproved ? (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        <FiCheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        <FiClock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiMail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-800 font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FiShield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <p className="text-gray-800 font-medium capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiUserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <p className="text-gray-800 font-medium">
                        {user?.isApproved ? "Approved" : "Pending Approval"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-gray-800 font-medium">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 font-medium"
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
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all font-medium"
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
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Account Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• You can update your profile information at any time</p>
            <p>• Your email address is used for login and cannot be changed</p>
            {user?.role === "admin" && (
              <p>• As an administrator, you have full access to manage users and files</p>
            )}
            {user?.role === "user" && user?.isApproved && (
              <p>• Your account has been verified and you have full access to documents</p>
            )}
            {!user?.isApproved && user?.role !== "admin" && (
              <p className="text-yellow-600">• Your account is pending admin approval. You'll be notified once approved.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;