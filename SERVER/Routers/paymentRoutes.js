const express = require("express");
const {
  createOrder,
  verifyPayment,
  getPaymentsByUser,
  getPaymentById,
  getAllPayments,
} = require("../Controllers/paymentController");
const { auth, userAuth } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/payments/create_order",auth, createOrder);
router.post("/payments/verify", auth, verifyPayment);
router.get("/payments/user/:user_id", auth, getPaymentsByUser);
router.get("/payments/:payment_record_id", auth, getPaymentById);
router.get("/payments", auth, getAllPayments);

module.exports = router;
