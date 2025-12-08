const express = require("express");
const {
  upsertSellerProfile,
  getSellerProfile,
  getSellerProducts,
  getSellerOrders,
  getAllSellers,
  getSellerByIdAdmin,
  deleteSeller,
  approveSeller,
  rejectSeller,
  getSellerByPhone,
  updateSellerPayout
} = require("../Controllers/sellerController");
const { auth, adminAuth, sellerAuth } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/seller/profile", upsertSellerProfile);
router.get("/seller/:seller_id", auth, getSellerProfile);
router.get("/seller/:seller_id/products", auth, getSellerProducts);
router.get("/seller/:seller_id/orders", auth, getSellerOrders);
router.get("/seller/by-phone/:phone", getSellerByPhone);
router.put(
  "/admin/seller/:seller_id/payout",
  auth,
  updateSellerPayout
);

router.get("/admin/sellers", auth, adminAuth, getAllSellers);
router.get("/admin/seller/:seller_id", auth, adminAuth, getSellerByIdAdmin);
router.delete("/admin/seller/:seller_id", auth, adminAuth, deleteSeller);
router.put("/admin/seller/:seller_id/approve", auth, adminAuth, approveSeller);
router.put("/admin/seller/:seller_id/reject", auth, adminAuth, rejectSeller);

module.exports = router;

