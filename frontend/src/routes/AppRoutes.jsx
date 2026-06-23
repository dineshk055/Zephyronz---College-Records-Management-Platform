import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyOtp from "../pages/VerifyOtp";
import Home from "../pages/Home";
import AdminDashboard from "../pages/AdminDashboard";
import ContentViewer from "../pages/ContentViewer";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import ProfileCard from "../pages/ProfileCard";

const AppRoutes = () => {
  return (
    <Routes>

      {/* default redirect */}
      <Route path="/" element={<Navigate to="/home" />} />

      {/* public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* user protected */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileCard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/:id"
        element={
          <ProtectedRoute>
            <ContentViewer />
          </ProtectedRoute>
        }
      />

      {/* admin only */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<h1>404 Not Found</h1>} />

    </Routes>
  );
};

export default AppRoutes;