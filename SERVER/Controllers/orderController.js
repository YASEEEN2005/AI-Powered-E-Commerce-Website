const Order = require("../Models/Order");

// GET /api/orders/user/:user_id
const getOrdersByUser = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const orders = await Order.find({ user_id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/orders/:order_id
const getOrderById = async (req, res) => {
  try {
    const order_id = Number(req.params.order_id);

    const order = await Order.findOne({ order_id });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/orders  (admin use)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error getting all orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// PUT /api/orders/:order_id/status
// body: { order_status, payment_status? }
const updateOrderStatus = async (req, res) => {
  try {
    const order_id = Number(req.params.order_id);
    const { order_status, payment_status } = req.body;

    const updateData = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    const order = await Order.findOneAndUpdate({ order_id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// PUT /api/orders/:order_id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order_id = Number(req.params.order_id);

    const order = await Order.findOne({ order_id });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.order_status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    order.order_status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
