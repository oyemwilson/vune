import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(401);
      throw new Error('Please verify your email before logging in');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate OTP for email verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create({
    name,
    email,
    password,
    otp: otp,
    otpExpiry: otpExpiry,
    isEmailVerified: false,
  });

  if (user) {
    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Email Verification',
        message: `Your email verification OTP is: ${otp}. This OTP will expire in 10 minutes.`,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified,
        message: 'User registered successfully. Please check your email for verification OTP.',
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // If email sending fails, still return success but with different message
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified,
        message: 'User registered successfully. Email verification temporarily unavailable.',
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify email with OTP
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Validate required fields
  if (!email || !otp) {
    res.status(400);
    throw new Error('Please provide email and OTP');
  }

  console.log('DEBUG verify-email:', { email, otp });

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isEmailVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  // Check if OTP exists
  if (!user.otp) {
    res.status(400);
    throw new Error('No OTP found. Please request a new one');
  }

  // Check if OTP has expired
  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    res.status(400);
    throw new Error('OTP has expired. Please request a new one');
  }

  // Compare OTPs as strings
  if (String(user.otp).trim() !== String(otp).trim()) {
    console.log('DEBUG stored OTP:', user.otp);
    console.log('DEBUG received OTP:', otp);
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Mark email as verified and clear OTP fields
  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  // Generate JWT token for automatic login
  generateToken(res, user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isEmailVerified: user.isEmailVerified,
    message: 'Email verified successfully',
  });
});

// @desc    Resend OTP for email verification
// @route   POST /api/users/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide email');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isEmailVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;

  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Email Verification - New OTP',
      message: `Your new email verification OTP is: ${otp}. This OTP will expire in 10 minutes.`,
    });

    res.json({
      message: 'New OTP sent successfully. Please check your email.',
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500);
    throw new Error('Failed to send OTP. Please try again.');
  }
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide email');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if a valid OTP already exists
  if (
    user.passwordResetOTP &&
    user.passwordResetOTPExpiry &&
    user.passwordResetOTPExpiry > new Date()
  ) {
    console.log('DEBUG existing resetPasswordOTP:', user.passwordResetOTP);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP (Resent)',
        message: `Your existing password reset OTP is: ${user.passwordResetOTP}. It will expire at ${user.passwordResetOTPExpiry.toLocaleString()}.`,
      });

      return res.json({
        message: 'An existing valid OTP was resent to your email.',
      });
    } catch (err) {
      console.error('DEBUG resend email failed:', err);
      res.status(500);
      throw new Error('Failed to resend OTP. Please try again.');
    }
  }

  // Generate a new OTP
  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Clear any existing reset tokens
  user.passwordResetOTP = resetOTP;
  user.passwordResetOTPExpiry = resetOTPExpiry;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;

  await user.save();

  console.log('DEBUG new resetPasswordOTP saved:', user.passwordResetOTP);

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP',
      message: `Your password reset OTP is: ${resetOTP}. This OTP will expire in 10 minutes.`,
    });

    res.json({ message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    // Clean up if sending fails
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiry = undefined;
    await user.save();

    console.error('DEBUG email send error:', error);
    res.status(500);
    throw new Error('Failed to send reset OTP. Please try again.');
  }
});

// @desc    Verify reset OTP
// @route   POST /api/users/verify-reset-otp
// @access  Public
const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Please provide email and OTP');
  }

  console.log('DEBUG verify-reset-otp incoming:', { email, otp });

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if OTP exists
  if (!user.passwordResetOTP) {
    res.status(400);
    throw new Error('No reset OTP found. Please request a new one');
  }

  // Check if OTP has expired
  if (!user.passwordResetOTPExpiry || user.passwordResetOTPExpiry < new Date()) {
    res.status(400);
    throw new Error('OTP has expired. Please request a new one');
  }

  console.log('DEBUG stored resetPasswordOTP:', user.passwordResetOTP);
  console.log('DEBUG comparing with received otp:', otp);

  // Compare OTPs as strings
  if (String(user.passwordResetOTP).trim() !== String(otp).trim()) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.passwordResetToken = resetToken;
  user.passwordResetTokenExpiry = resetTokenExpiry;
  // Keep OTP until password is actually reset
  
  await user.save();

  res.json({ 
    message: 'OTP verified successfully', 
    resetToken 
  });
});

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    res.status(400);
    throw new Error('Please provide reset token and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Update password and clear all reset fields
  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpiry = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;

  await user.save();

  res.json({
    message: 'Password reset successfully',
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } else {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    
    // If email is being changed, require verification
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already exists');
      }
      
      user.email = req.body.email;
      user.isEmailVerified = false;
      
      // Generate new OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      
      // Send verification email
      try {
        await sendEmail({
          to: user.email,
          subject: 'Email Verification Required',
          message: `Your email has been changed. Please verify with OTP: ${otp}. This OTP will expire in 10 minutes.`,
        });
      } catch (error) {
        console.error('Email sending failed:', error);
        // Continue even if email fails
      }
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isEmailVerified: updatedUser.isEmailVerified,
      message: updatedUser.isEmailVerified ? 'Profile updated successfully' : 'Profile updated. Please verify your new email.',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isEmailVerified: updatedUser.isEmailVerified,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const adminUsers = await User.countDocuments({ isAdmin: true });
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const unverifiedUsers = await User.countDocuments({ isEmailVerified: false });

  // Get new users in the last 30 days
  const newUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  // Get monthly user registration stats for the last 12 months
  const monthlyStats = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get recent users
  const recentUsers = await User.find({})
    .select('name email createdAt isEmailVerified')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    totalUsers,
    adminUsers,
    verifiedUsers,
    unverifiedUsers,
    newUsers,
    monthlyStats,
    recentUsers
  });
});

// @desc    Get current user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.wishlist);
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const productId = req.params.productId;
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  const updatedUser = await User.findById(req.user._id).populate('wishlist');
  res.json(updatedUser.wishlist);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== req.params.productId
  );
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');
  res.json(updatedUser.wishlist);
});

export {
  authUser,
  registerUser,
  verifyEmail,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getUserStats,
  logoutUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};