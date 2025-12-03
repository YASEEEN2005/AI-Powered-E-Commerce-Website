const express = require("express");
const {
  upsertSellerProfile,
  getSellerProfile,
  getSellerProducts,
  getSellerOrders,
  getAllSellers,
  getSellerByIdAdmin,
  deleteSeller,
} = require("../Controllers/sellerController");
const { auth, adminAuth, sellerAuth } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/seller/profile", upsertSellerProfile);
router.get("/seller/:seller_id", auth,getSellerProfile);
router.get("/seller/:seller_id/products", auth, getSellerProducts);
router.get("/seller/:seller_id/orders", auth, getSellerOrders);

router.get("/admin/sellers", auth, adminAuth, getAllSellers);
router.get("/admin/seller/:seller_id",auth, adminAuth, getSellerByIdAdmin);
router.delete("/admin/seller/:seller_id", auth, adminAuth, deleteSeller);

module.exports = router;
