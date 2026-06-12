import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { logScreenshot } from "../controllers/securityController.js";

const router = express.Router();

// Log screenshot - Protected (only authenticated users can log their actions)
router.post("/log-screenshot", protect, logScreenshot);

export default router;
