const express = require("express");
const router = express.Router();

const {
  createContactMessage,
  getAllContacts,
  getContactById,
  updateContactStatus,
} = require("../Controllers/contactController");

const { auth, adminAuth } = require("../Middleware/authMiddleware");

router.post("/contact", createContactMessage);

router.get("/contact", auth, getAllContacts);
router.get("/contact/:contact_id", auth, getContactById);
router.put("/contact/:contact_id/status", auth, updateContactStatus);

module.exports = router;
