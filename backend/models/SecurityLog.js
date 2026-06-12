import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String, // "screenshot", "unauthorized_action"
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);

export default SecurityLog;
