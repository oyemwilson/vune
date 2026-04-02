import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders,
  cancelOrder,
  getOrderStats,
  getRecentOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.route('/').post(protect, addOrderItems);

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.route('/myorders').get(protect, getMyOrders);

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
router.route('/').get(protect, admin, getOrders);

// @desc    Get order stats (admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
router.route('/stats').get(protect, admin, getOrderStats);

// @desc    Get recent orders (admin)
// @route   GET /api/orders/recent
// @access  Private/Admin
router.route('/recent').get(protect, admin, getRecentOrders);

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
router.route('/:id').get(protect, checkObjectId, getOrderById);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.route('/:id/pay').put(protect, checkObjectId, updateOrderToPaid);

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.route('/:id/deliver').put(protect, admin, checkObjectId, updateOrderToDelivered);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.route('/:id/status').put(protect, admin, checkObjectId, updateOrderStatus);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.route('/:id/cancel').put(protect, checkObjectId, cancelOrder);

export default router;
