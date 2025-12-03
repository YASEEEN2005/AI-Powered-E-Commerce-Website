const express = require("express");
const {
  addToWishlist,
  getWishlistByUser,
  removeFromWishlist,
  clearWishlist,
} = require("../Controllers/wishlistController");
const { auth, userAuth } = require("../Middleware/authMiddleware");
const router = express.Router();

router.post("/wishlist/add", auth, userAuth, addToWishlist);
router.get("/wishlist/:user_id", auth, userAuth, getWishlistByUser);
router.delete("/wishlist/item", auth, userAuth, removeFromWishlist);
router.delete("/wishlist/:user_id", auth, userAuth, clearWishlist);

module.exports = router;
