const Seller = require("../Models/Seller");
const Product = require("../Models/Product");
const Order = require("../Models/Order");
const { generateToken } = require("../Middleware/authMiddleware");


// POST /api/seller/profile
const upsertSellerProfile = async (req, res) => {
  try {
    const {
      phone,
      email,
      name,
      shop_name,
      location,
      bank_name,
      account_number,
      ifsc_code,
    } = req.body;

    if (
      !phone ||
      !name ||
      !shop_name ||
      !location ||
      !bank_name ||
      !account_number ||
      !ifsc_code
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    let seller = await Seller.findOne({ phone });

    if (!seller) {
      seller = await Seller.create({
        phone,
        email,
        name,
        shop_name,
        location,
        bank_name,
        account_number,
        ifsc_code,
      });
    } else {
      seller.phone = phone;
      seller.email = email || seller.email;
      seller.name = name;
      seller.shop_name = shop_name;
      seller.location = location;
      seller.bank_name = bank_name;
      seller.account_number = account_number;
      seller.ifsc_code = ifsc_code;
      await seller.save();
    }

    const token = generateToken({
      seller_id: seller.seller_id,
      phone: seller.phone,
      role: "seller",
    });

    return res.status(200).json({
      success: true,
      message: "Seller profile saved",
      data: seller,
      token,
    });
  } catch (error) {
    console.error("Error saving seller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/seller/:seller_id
const getSellerProfile = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);

    const seller = await Seller.findOne({ seller_id });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    return res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (error) {
    console.error("Error getting seller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/seller/:seller_id/products
const getSellerProducts = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);

    const products = await Product.find({ seller_id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error getting seller products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/seller/:seller_id/orders
const getSellerOrders = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);

    const products = await Product.find({ seller_id });
    const productIds = products.map((p) => p.product_id);

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "This seller has no products",
        data: [],
      });
    }

    const orders = await Order.find({
      "items.product_id": { $in: productIds },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error getting seller orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/admin/sellers → list all sellers
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    console.error("Error getting all sellers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/admin/seller/:seller_id → admin view single seller
const getSellerByIdAdmin = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);

    const seller = await Seller.findOne({ seller_id });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    return res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (error) {
    console.error("Error getting seller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE /api/admin/seller/:seller_id
const deleteSeller = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);

    const seller = await Seller.findOneAndDelete({ seller_id });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    await Product.deleteMany({ seller_id });

    return res.status(200).json({
      success: true,
      message: "Seller and their products deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting seller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  upsertSellerProfile,
  getSellerProfile,
  getSellerProducts,
  getSellerOrders,
  getAllSellers,
  getSellerByIdAdmin,
  deleteSeller,
};
