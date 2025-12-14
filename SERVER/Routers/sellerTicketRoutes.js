const express = require("express");
const router = express.Router();

const {
  createSellerTicket,
  getSellerTickets,
  getAllSellerTickets,
  updateSellerTicket,
} = require("../Controllers/sellerTicketController");

const {
  auth,
  sellerAuth,
  adminAuth,
} = require("../Middleware/authMiddleware");

router.post("/seller/support", auth, createSellerTicket);
router.get("/seller/support/:seller_id", auth, getSellerTickets);

router.get("/admin/seller-support", auth, getAllSellerTickets);
router.put(
  "/admin/seller-support/:ticket_id",
  auth,
  updateSellerTicket
);

module.exports = router;
