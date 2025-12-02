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

const router = express.Router();

router.post("/seller/profile", upsertSellerProfile);
router.get("/seller/:seller_id", getSellerProfile);
router.get("/seller/:seller_id/products", getSellerProducts);
router.get("/seller/:seller_id/orders", getSellerOrders);

router.get("/admin/sellers", getAllSellers);
router.get("/admin/seller/:seller_id", getSellerByIdAdmin);
router.delete("/admin/seller/:seller_id", deleteSeller);

module.exports = router;
