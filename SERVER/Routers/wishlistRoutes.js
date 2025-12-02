const express = require("express");
const {
  addToWishlist,
  getWishlistByUser,
  removeFromWishlist,
  clearWishlist,
} = require("../Controllers/wishlistController");

const router = express.Router();

router.post("/wishlist/add", addToWishlist);
router.get("/wishlist/:user_id", getWishlistByUser);
router.delete("/wishlist/item", removeFromWishlist);
router.delete("/wishlist/:user_id", clearWishlist);

module.exports = router;
