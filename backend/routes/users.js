import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { getUsers, approveUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// Get all users - Admin only
router.get("/", protect, adminOnly, getUsers);

// Approve user - Admin only
router.put("/:id/approve", protect, adminOnly, approveUser);

// Delete user - Admin only
router.delete("/:id", protect, adminOnly, deleteUser);

// Get user profile - Protected
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

export default router;