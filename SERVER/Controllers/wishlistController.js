const Wishlist = require("../Models/Wishlist");
const User = require("../Models/User");
const Product = require("../Models/Product");

// POST /api/wishlist/add
// body: { user_id, product_id }
const addToWishlist = async (req, res) => {
  try {
    let { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and product_id are required",
      });
    }

    user_id = Number(user_id);
    product_id = Number(product_id);

    const user = await User.findOne({ user_id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const product = await Product.findOne({ product_id });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user_id,
        items: [
          {
            product_id: product.product_id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "",
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: wishlist,
      });
    }

    const exists = wishlist.items.some(
      (item) => item.product_id === product_id
    );

    if (exists) {
      return res.status(200).json({
        success: true,
        message: "Product already in wishlist",
        data: wishlist,
      });
    }

    wishlist.items.push({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
    });

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/wishlist/:user_id
const getWishlistByUser = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        data: { user_id, items: [] },
      });
    }

    return res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE /api/wishlist/item
// body: { user_id, product_id }
const removeFromWishlist = async (req, res) => {
  try {
    let { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and product_id are required",
      });
    }

    user_id = Number(user_id);
    product_id = Number(product_id);

    const wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    const newItems = wishlist.items.filter(
      (item) => item.product_id !== product_id
    );

    wishlist.items = newItems;
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE /api/wishlist/:user_id  -> clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    wishlist.items = [];
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared",
      data: wishlist,
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlistByUser,
  removeFromWishlist,
  clearWishlist,
};
