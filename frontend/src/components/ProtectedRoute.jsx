import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PendingApproval from "./PendingApproval";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, isApproved } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is approved (except for admin)
  if (!isApproved && user?.role !== "admin") {
    return <PendingApproval />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/home" />;
  }

  return children;
};

export default ProtectedRoute;