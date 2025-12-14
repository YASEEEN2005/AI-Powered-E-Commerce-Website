const SellerTicket = require("../Models/SellerTicket");

/**
 * POST /api/seller/support
 * Seller creates ticket
 */
const createSellerTicket = async (req, res) => {
  try {
    const {
      seller_id,
      subject,
      category,
      order_id,
      priority,
      message,
    } = req.body;

    if (!seller_id || !subject || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const ticket = await SellerTicket.create({
      seller_id,
      subject,
      category,
      order_id,
      priority,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Create seller ticket error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/seller/support/:seller_id
 * Seller view own tickets
 */
const getSellerTickets = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);

    const tickets = await SellerTicket.find({ seller_id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Get seller tickets error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * GET /api/admin/seller-support
 * Admin view all tickets
 */
const getAllSellerTickets = async (req, res) => {
  try {
    const tickets = await SellerTicket.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Get all seller tickets error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * PUT /api/admin/seller-support/:ticket_id
 * Admin update ticket status / reply
 */
const updateSellerTicket = async (req, res) => {
  try {
    const ticket_id = Number(req.params.ticket_id);
    const { status, admin_reply } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (admin_reply) updateData.admin_reply = admin_reply;

    const ticket = await SellerTicket.findOneAndUpdate(
      { ticket_id },
      updateData,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Update seller ticket error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createSellerTicket,
  getSellerTickets,
  getAllSellerTickets,
  updateSellerTicket,
};
