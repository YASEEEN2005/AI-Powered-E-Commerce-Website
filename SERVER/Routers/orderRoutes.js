const express = require("express");
const {
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../Controllers/orderController");

const router = express.Router();

// user routes
router.get("/orders/user/:user_id", getOrdersByUser);
router.get("/orders/:order_id", getOrderById);

// admin routes
router.get("/orders", getAllOrders);
router.put("/orders/:order_id/status", updateOrderStatus);
router.put("/orders/:order_id/cancel", cancelOrder);

module.exports = router;
