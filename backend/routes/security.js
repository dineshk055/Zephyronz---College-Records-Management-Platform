import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { logScreenshot, logActivity } from "../controllers/securityController.js";

const router = express.Router();

// Log screenshot - Protected (only authenticated users can log their actions)
router.post("/log-screenshot", protect, logScreenshot);

// Log general activity (tab switch, window blur, developer keys)
router.post("/log-activity", protect, logActivity);

export default router;
