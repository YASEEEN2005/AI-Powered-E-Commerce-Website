const Cart = require("../Models/Cart");
const Wishlist = require("../Models/Wishlist");
const Product = require("../Models/Product");
const { geminiRecommend } = require("../AI/geminiRecommendation");

const getPersonalizedRecommendations = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const cart = await Cart.findOne({ user_id });
    const wishlist = await Wishlist.findOne({ user_id });
    const products = await Product.find();

    const result = await geminiRecommend(
      cart?.items || [],
      wishlist?.items || [],
      products
    );

    res.status(200).json({
      success: true,
      reason: result.reason,
      products: products.filter(p =>
        result.productIds.includes(p.product_id)
      ),
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
    });
  }
};

module.exports = { getPersonalizedRecommendations };
