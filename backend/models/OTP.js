import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 1800, // 30 minutes (1800 seconds) to prevent clock drift issues; 5-min limit enforced in code
    },
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
