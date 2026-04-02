import express from 'express';
import {
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
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// =======================
// Public Auth Routes
// =======================
router.post('/auth', authUser);
router.post('/', registerUser);

// Email verification
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);

// Password reset flows
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Logout
router.post('/logout', logoutUser);

// =======================
// Protected User Profile
// =======================
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Change password
router.put('/change-password', protect, changePassword);

// =======================
// Wishlist (private)
// =======================
router
  .route('/wishlist')
  .get(protect, getWishlist); // get logged-in user's wishlist

router
  .route('/wishlist/:productId')
  .post(protect, addToWishlist)   // add product
  .delete(protect, removeFromWishlist); // remove product

// =======================
// Admin Routes
// =======================
router.get('/stats', protect, admin, getUserStats);

router
  .route('/')
  .get(protect, admin, getUsers); // get all users

router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
