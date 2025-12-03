const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../Controllers/productController");
const { auth } = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/products", auth, getProducts);
router.get("/products/:product_id", auth, getProductById);
router.post("/products",  auth, createProduct);
router.put("/products/:product_id", auth, updateProduct);
router.delete("/products/:product_id", auth, deleteProduct);

module.exports = router;