const express = require("express");
const {
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../Controllers/orderController");
const { auth } = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/orders/user/:user_id", auth, getOrdersByUser);
router.get("/orders/:order_id", auth, getOrderById);

router.get("/orders", auth, getAllOrders);
router.put("/orders/:order_id/status", auth, updateOrderStatus);
router.put("/orders/:order_id/cancel", auth, cancelOrder);

module.exports = router;
