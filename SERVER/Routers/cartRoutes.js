const express = require("express");
const {
  addToCart,
  getCartByUser,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../Controllers/cartController");

const router = express.Router();

router.post("/cart/add", addToCart);
router.get("/cart/:user_id", getCartByUser);
router.put("/cart/item", updateCartItem);
router.delete("/cart/item", removeCartItem);
router.delete("/cart/:user_id", clearCart);

module.exports = router;
