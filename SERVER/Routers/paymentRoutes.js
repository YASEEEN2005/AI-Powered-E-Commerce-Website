const express = require("express");
const {
  createOrder,
  verifyPayment,
  getPaymentsByUser,
  getPaymentById,
  getAllPayments,
} = require("../Controllers/paymentController");

const router = express.Router();

router.post("/payments/create_order", createOrder);
router.post("/payments/verify", verifyPayment);
router.get("/payments/user/:user_id", getPaymentsByUser);
router.get("/payments/:payment_record_id", getPaymentById);
router.get("/payments", getAllPayments);

module.exports = router;
