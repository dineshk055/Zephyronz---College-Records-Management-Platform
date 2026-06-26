import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import { sendPasswordResetOtpEmail, sendOtpSms } from '../utils/notificationService.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update name if provided
    if (name) {
      user.name = name;
    }
    
    // Update email if provided and not already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // Update phone if provided and not already taken
    if (phone !== undefined && phone !== user.phone) {
      if (phone.trim()) {
        const trimmedPhone = phone.trim();
        const existingPhone = await User.findOne({ phone: trimmedPhone });
        if (existingPhone && existingPhone._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'Phone number already in use' });
        }
        user.phone = trimmedPhone;
      } else {
        user.phone = undefined;
      }
    }
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve user
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot approve admin users' });
    }
    
    user.isApproved = true;
    user.status = "Approved";
    await user.save();

    if (req.io) {
      req.io.emit("user-status-changed", {
        userId: user._id,
        status: user.status,
        isApproved: user.isApproved,
        name: user.name,
        email: user.email
      });
    }
    
    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject user
// @route   PUT /api/users/:id/reject
// @access  Private/Admin
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot reject admin users' });
    }
    
    user.isApproved = false;
    user.status = "Rejected";
    await user.save();

    if (req.io) {
      req.io.emit("user-status-changed", {
        userId: user._id,
        status: user.status,
        isApproved: user.isApproved,
        name: user.name,
        email: user.email
      });
    }
    
    res.json({ message: 'User rejected successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject/Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }
    
    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send password reset OTP for logged in user
// @route   POST /api/users/change-password/send-otp
// @access  Private
export const sendChangePasswordOtp = async (req, res) => {
  try {
    const { method } = req.body;
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'User email not found' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (method === "sms") {
      if (!req.user.phone) {
        return res.status(400).json({ success: false, message: "No phone number registered on your profile. Please add one in profile settings first." });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB (upsert, reset attempts) using email as the query key
    await OTP.findOneAndUpdate(
      { email: trimmedEmail },
      { otp, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );

    let dispatchSuccess = false;
    let message = "";

    if (method === "sms") {
      dispatchSuccess = await sendOtpSms(req.user.phone.trim(), otp);

      if (!dispatchSuccess && process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification SMS. Please check your configuration or try again.",
        });
      }

      message = dispatchSuccess 
        ? 'Verification code sent to your phone number via SMS' 
        : 'OTP generated successfully (SMS delivery failed, using test fallback code)';
    } else {
      dispatchSuccess = await sendPasswordResetOtpEmail(trimmedEmail, otp);

      if (!dispatchSuccess && process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please check your email configuration or try again.",
        });
      }

      message = dispatchSuccess 
        ? 'OTP sent successfully to your email' 
        : 'OTP generated successfully (Email delivery failed, using test fallback code)';
    }

    // Provide test fallback OTP in non-production environments
    let testOtp = null;
    if (process.env.NODE_ENV !== 'production') {
      if (method === "sms") {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNum = process.env.TWILIO_PHONE_NUMBER;
        if (!accountSid || !authToken || !fromNum || !dispatchSuccess) {
          testOtp = otp;
        }
      } else {
        const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
        const user = process.env.SMTP_USER || process.env.EMAIL_USER;
        const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
        if (!host || !user || !pass || !dispatchSuccess) {
          testOtp = otp;
        }
      }
    }

    res.json({
      success: true,
      message,
      testOtp
    });
  } catch (error) {
    console.error('Error sending change password OTP:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password with OTP
// @route   POST /api/users/change-password/reset
// @access  Private
export const changePasswordWithOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'OTP and new password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const trimmedEmail = user.email.trim().toLowerCase();

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: trimmedEmail });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Check if OTP has expired (5 minutes = 300,000 ms) in code to avoid MongoDB Atlas clock drift issues
    const otpAgeMs = Date.now() - new Date(otpRecord.createdAt).getTime();
    if (otpAgeMs > 5 * 60 * 1000) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP value with brute-force check
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remaining = 5 - otpRecord.attempts;
      if (remaining <= 0) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Verification code has been invalidated. Please request a new one.'
        });
      }

      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remaining} attempts remaining.`
      });
    }

    // Delete OTP on success
    await OTP.deleteOne({ _id: otpRecord._id });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};