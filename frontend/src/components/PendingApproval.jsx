import { FiClock, FiAlertCircle } from "react-icons/fi";

const PendingApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiClock className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pending Approval
        </h2>
        <p className="text-gray-600 mb-4">
          Your account is waiting for admin approval. You will be notified once approved.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <FiAlertCircle className="w-4 h-4" />
            <p className="text-sm">Please check back later or contact admin.</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;