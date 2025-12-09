const express = require("express");
const {
  addToWishlist,
  getWishlistByUser,
  removeFromWishlist,
  clearWishlist,
} = require("../Controllers/wishlistController");
const { auth, userAuth } = require("../Middleware/authMiddleware");
const router = express.Router();

router.post("/wishlist/add", auth, addToWishlist);
router.get("/wishlist/:user_id", auth,  getWishlistByUser);
router.delete("/wishlist/item", auth, removeFromWishlist);
router.delete("/wishlist/:user_id", auth, clearWishlist);

module.exports = router;
