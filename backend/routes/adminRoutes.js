import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import SecurityLog from "../models/SecurityLog.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  adminOnly,

  (req, res) => {

    res.status(200).json({
      success: true,
      msg: "Welcome Admin",
      user: req.user,
    });

  }
);

router.get(
  "/security-logs",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const logs = await SecurityLog.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        logs,
      });
    } catch (error) {
      console.error("Error fetching security logs:", error);
      res.status(500).json({
        success: false,
        msg: "Server error",
      });
    }
  }
);

// Delete single security log
router.delete(
  "/security-logs/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const log = await SecurityLog.findByIdAndDelete(req.params.id);
      if (!log) {
        return res.status(404).json({
          success: false,
          msg: "Security log not found",
        });
      }
      res.status(200).json({
        success: true,
        msg: "Security log deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting security log:", error);
      res.status(500).json({
        success: false,
        msg: "Server error",
      });
    }
  }
);

// Delete all security logs
router.delete(
  "/security-logs",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      await SecurityLog.deleteMany({});
      res.status(200).json({
        success: true,
        msg: "All security logs deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting all security logs:", error);
      res.status(500).json({
        success: false,
        msg: "Server error",
      });
    }
  }
);

export default router;

// http://localhost:3000/api/admin/dashboard