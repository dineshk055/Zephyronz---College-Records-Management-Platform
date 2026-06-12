import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { getUsers, approveUser, rejectUser, deleteUser, getUserProfile, updateUserProfile } from "../controllers/userController.js";

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

export default router;