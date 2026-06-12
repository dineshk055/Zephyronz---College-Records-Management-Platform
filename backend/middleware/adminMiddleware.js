import SecurityLog from "../models/SecurityLog.js";

export const adminOnly = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const userId = req.user ? req.user._id : null;
      const userName = req.user ? req.user.name : "Unknown User";
      const userEmail = req.user ? req.user.email : "Unknown Email";
      const details = `Unauthorized access attempt to ${req.method} ${req.originalUrl} by user ${userName} (${userEmail})`;

      // Log in database
      const log = await SecurityLog.create({
        eventType: "unauthorized_action",
        user: userId,
        details,
        ipAddress,
        userAgent,
      });

      // Notify admin
      if (req.io) {
        req.io.to("admin-room").emit("notification", {
          type: "unauthorized_action",
          title: "Unauthorized Action Blocked",
          message: `${userName} tried to access administrative controls.`,
          details,
          userId,
          userEmail,
          userName,
          timestamp: log.createdAt,
        });
      }

      return res.status(403).json({
        success: false,
        msg: "Admin access only",
      });
    }
  } catch (error) {
    console.error("Error in adminOnly middleware:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};