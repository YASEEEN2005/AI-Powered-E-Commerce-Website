const express = require("express");
const {
  addToCart,
  getCartByUser,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../Controllers/cartController");

const { auth, userAuth } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/cart/add", auth, addToCart);
router.get("/cart/:user_id", auth, getCartByUser);
router.put("/cart/item", auth, updateCartItem);
router.delete("/cart/item", auth, removeCartItem);
router.delete("/cart/:user_id", auth, clearCart);

module.exports = router;
