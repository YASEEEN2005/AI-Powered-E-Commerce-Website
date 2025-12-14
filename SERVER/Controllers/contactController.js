const ContactMessage = require("../Models/ContactMessage");

/**
 * POST /api/contact
 * Create new contact message
 */
const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Contact create error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/contact
 * Admin: get all contact messages
 */
const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactMessage.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/contact/:contact_id
 */
const getContactById = async (req, res) => {
  try {
    const contact_id = Number(req.params.contact_id);

    const contact = await ContactMessage.findOne({ contact_id });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * PUT /api/contact/:contact_id/status
 */
const updateContactStatus = async (req, res) => {
  try {
    const contact_id = Number(req.params.contact_id);
    const { status } = req.body;

    if (!["new", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updated = await ContactMessage.findOneAndUpdate(
      { contact_id },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update contact status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createContactMessage,
  getAllContacts,
  getContactById,
  updateContactStatus,
};
