import User from "../models/User.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail, sendOtpEmail } from "../utils/notificationService.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // check empty fields
    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields, including the verification OTP code.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // verify OTP
    const otpRecord = await OTP.findOne({ email: trimmedEmail });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code. Please request a new one.",
      });
    }

    // Check if OTP has expired (5 minutes = 300,000 ms) in code to avoid MongoDB Atlas clock drift issues
    const otpAgeMs = Date.now() - new Date(otpRecord.createdAt).getTime();
    if (otpAgeMs > 5 * 60 * 1000) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // check brute force and value
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      const remaining = 5 - otpRecord.attempts;
      if (remaining <= 0) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Verification code has been invalidated. Please request a new one.",
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remaining} attempts remaining.`,
      });
    }

    // delete OTP once verified (single-use)
    await OTP.deleteOne({ _id: otpRecord._id });

    // check existing user
    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // count users
    const usersCount = await User.countDocuments();

    let role = "user";
    let isApproved = false;
    let status = "Pending";

    // first user becomes admin (auto-approved)
    if (usersCount === 0) {
      role = "admin";
      isApproved = true;
      status = "Approved";
    }

    // create user
    const user = await User.create({
      name,
      email: trimmedEmail,
      password: hashedPassword,
      role,
      isApproved,
      status,
    });

    // Send email notification (asynchronously, does not block register response)
    sendRegistrationEmail({ name: user.name, email: user.email }).catch(err => {
      console.error("Async registration email error:", err);
    });

    // Emit real-time notification to admin if it's a new user registration
    if (req.io && role !== "admin") {
      req.io.to("admin-room").emit("notification", {
        type: "new_registration",
        title: "New Registration Request",
        message: `${user.name} (${user.email}) has registered and is pending approval.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please wait for admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        status: user.status,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check empty fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please fill all fields",
      });
    }

    // check user exists
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // CHECK APPROVAL - This is the key!
    const effectiveStatus = user.status || (user.isApproved ? "Approved" : "Pending");

    if (effectiveStatus === "Rejected") {
      return res.status(403).json({
        success: false,
        msg: "Your account registration has been rejected by the admin.",
      });
    }

    if (effectiveStatus === "Pending") {
      return res.status(403).json({
        success: false,
        msg: "Your account is pending admin approval. Please wait for approval.",
      });
    }

    // generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        status: user.status,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // success response
    return res.status(200).json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        status: user.status,
      },
    });

  } catch (error) {
    console.log("error in login controller", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // check existing user
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // save OTP to DB (upsert if exists, reset attempts)
    await OTP.findOneAndUpdate(
      { email: trimmedEmail },
      { otp, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // send OTP email
    const emailSent = await sendOtpEmail(trimmedEmail, otp);

    // In production, if email failed to send, return error response.
    if (!emailSent && process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please check your email configuration or try again.",
      });
    }

    // If SMTP is not fully configured or email dispatch fails, provide a test OTP back to frontend in non-production
    let testOtp = null;
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if ((!host || !user || !pass || !emailSent) && process.env.NODE_ENV !== 'production') {
      testOtp = otp;
    }

    res.status(200).json({
      success: true,
      message: emailSent ? "OTP sent successfully to your email" : "OTP generated successfully (Email delivery failed, using test fallback code)",
      testOtp,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};