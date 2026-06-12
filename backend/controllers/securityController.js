import SecurityLog from "../models/SecurityLog.js";

// @desc    Log screenshot attempt
// @route   POST /api/security/log-screenshot
// @access  Private
export const logScreenshot = async (req, res) => {
  try {
    const { details } = req.body;
    
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name : "Unknown User";
    const userEmail = req.user ? req.user.email : "Unknown Email";

    const log = await SecurityLog.create({
      eventType: "screenshot",
      user: userId,
      details: details || `Screenshot attempt by ${userName}`,
      ipAddress,
      userAgent,
    });

    // Send real-time notification to admin room
    if (req.io) {
      req.io.to("admin-room").emit("notification", {
        type: "screenshot_attempt",
        title: "Screenshot Attempt Detected",
        message: `${userName} (${userEmail}) attempted to take a screenshot.`,
        details: log.details,
        userId: userId,
        userEmail: userEmail,
        userName: userName,
        timestamp: log.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      msg: "Security event logged successfully",
      log,
    });
  } catch (error) {
    console.error("Error logging security event:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

// @desc    Log generic suspicious activity
// @route   POST /api/security/log-activity
// @access  Private
export const logActivity = async (req, res) => {
  try {
    const { eventType, details } = req.body;
    
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name : "Unknown User";
    const userEmail = req.user ? req.user.email : "Unknown Email";

    const log = await SecurityLog.create({
      eventType: eventType || "suspicious_activity",
      user: userId,
      details: details || `Suspicious activity detected for ${userName}`,
      ipAddress,
      userAgent,
    });

    // Send real-time notification to admin room
    if (req.io) {
      req.io.to("admin-room").emit("notification", {
        type: eventType || "suspicious_activity",
        title: "Suspicious Activity Detected",
        message: `${userName} (${userEmail}): ${details || 'Suspicious behavior detected'}`,
        details: log.details,
        userId: userId,
        userEmail: userEmail,
        userName: userName,
        timestamp: log.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      msg: "Security event logged successfully",
      log,
    });
  } catch (error) {
    console.error("Error logging security event:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
