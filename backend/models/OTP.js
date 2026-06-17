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
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes in seconds (MongoDB expects seconds for TTL index, but mongoose expires property takes seconds: 600 seconds = 10 minutes)
    },
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
