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

router.post("/cart/add", auth, userAuth, addToCart);
router.get("/cart/:user_id", auth, userAuth, getCartByUser);
router.put("/cart/item", auth, userAuth, updateCartItem);
router.delete("/cart/item", auth, userAuth, removeCartItem);
router.delete("/cart/:user_id", auth, userAuth, clearCart);

module.exports = router;
