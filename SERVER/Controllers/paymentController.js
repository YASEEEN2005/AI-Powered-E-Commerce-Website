require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../Models/Payment");
const Cart = require("../Models/Cart");
const User = require("../Models/User");
const Order = require("../Models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order from user's cart
// POST /api/payments/create-order
// body: { user_id }
const createOrder = async (req, res) => {
  try {
    let { user_id } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "user_id is required" });
    }

    user_id = Number(user_id);

    const user = await User.findOne({ user_id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const amountInRupees = cart.totalAmount;
    if (!amountInRupees || amountInRupees <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart total",
      });
    }
    const amountInPaise = Math.round(amountInRupees * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${user_id}_${Date.now()}`,
      notes: {
        user_id: String(user_id),
      },
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      user_id,
      razorpay_order_id: order.id,
      amount: amountInRupees,
      currency: order.currency,
      status: "created",
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        payment_record_id: payment.payment_record_id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Verify Razorpay payment
// POST /api/payments/verify
// body: { user_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, shipping_address? }
const verifyPayment = async (req, res) => {
  try {
    const {
      user_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shipping_address = "",
    } = req.body;

    if (
      !user_id ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "user_id, razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    const signData = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signData)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    const payment = await Payment.findOne({
      user_id: Number(user_id),
      razorpay_order_id,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    if (!isValid) {
      payment.status = "failed";
      payment.razorpay_payment_id = razorpay_payment_id;
      payment.razorpay_signature = razorpay_signature;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    payment.status = "paid";
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    await payment.save();

    const cart = await Cart.findOne({ user_id: Number(user_id) });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verified, but cart is empty. Order cannot be created.",
      });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      user_id: Number(user_id),
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image: item.image,
      })),
      subtotal,
      gst_amount: cart.gst_amount || 0,
      platform_fee: cart.platform_fee || 0,
      totalAmount: cart.totalAmount || subtotal,
      payment_status: "paid",
      order_status: "placed",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shipping_address,
    });

    cart.items = [];
    cart.totalAmount = 0;
    cart.gst_amount = 0;
    cart.platform_fee = 0;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified & order created successfully",
      data: {
        payment,
        order,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/payments/user/:user_id
const getPaymentsByUser = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const payments = await Payment.find({ user_id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Error getting user payments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/payments/:payment_record_id
const getPaymentById = async (req, res) => {
  try {
    const payment_record_id = Number(req.params.payment_record_id);

    const payment = await Payment.findOne({ payment_record_id });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error getting payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//GET /api/payments  -> all payments (admin use)
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error getting all payments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentsByUser,
  getPaymentById,
  getAllPayments,
};
