import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { getUsers, approveUser, rejectUser, deleteUser, getUserProfile, updateUserProfile, sendChangePasswordOtp, changePasswordWithOtp } from "../controllers/userController.js";

const router = express.Router();

// Get user profile - Protected (must come BEFORE /:id routes)
router.get("/profile", protect, getUserProfile);

// Update user profile - Protected
router.put("/profile", protect, updateUserProfile);

// Get all users - Admin only
router.get("/", protect, adminOnly, getUsers);

// Approve user - Admin only
router.put("/:id/approve", protect, adminOnly, approveUser);

// Reject user - Admin only
router.put("/:id/reject", protect, adminOnly, rejectUser);

// Delete user - Admin only
router.delete("/:id", protect, adminOnly, deleteUser);

// Change password (send OTP) - Protected
router.post("/change-password/send-otp", protect, sendChangePasswordOtp);

// Change password (verify & reset) - Protected
router.post("/change-password/reset", protect, changePasswordWithOtp);

export default router;