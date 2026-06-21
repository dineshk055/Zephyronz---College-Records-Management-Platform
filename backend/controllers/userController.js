import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import { sendPasswordResetOtpEmail } from '../utils/notificationService.js';

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
    const { name, email } = req.body;
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
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
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
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'User email not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB (upsert, reset attempts)
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send OTP email
    const emailSent = await sendPasswordResetOtpEmail(email.toLowerCase(), otp);

    // Provide test fallback OTP in non-production environments
    let testOtp = null;
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if ((!host || !user || !pass || !emailSent) && process.env.NODE_ENV !== 'production') {
      testOtp = otp;
    }

    res.json({
      success: true,
      message: emailSent ? 'OTP sent successfully to your email' : 'OTP generated successfully (Email delivery failed, using test fallback code)',
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

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: user.email.toLowerCase() });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });
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