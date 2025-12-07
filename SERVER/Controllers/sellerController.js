const Seller = require("../Models/Seller");
const Product = require("../Models/Product");
const Order = require("../Models/Order");

const upsertSellerProfile = async (req, res) => {
  try {
    const {
      seller_id,
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
        message: "Missing required fields",
      });
    }

    let seller = null;

    if (seller_id) {
      seller = await Seller.findOne({ seller_id });
    }

    if (!seller) {
      seller = new Seller({
        phone,
        email,
        name,
        shop_name,
        location,
        bank_name,
        account_number,
        ifsc_code,
      });
      await seller.save();

      return res.status(201).json({
        success: true,
        message: "Seller profile created successfully",
        data: seller,
      });
    }

    seller.phone = phone;
    seller.email = email || seller.email;
    seller.name = name;
    seller.shop_name = shop_name;
    seller.location = location;
    seller.bank_name = bank_name;
    seller.account_number = account_number;
    seller.ifsc_code = ifsc_code;
    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Seller profile updated successfully",
      data: seller,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSellerProfile = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    const seller = await Seller.findOne({ seller_id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    const products = await Product.find({ seller_id });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    const orders = await Order.find({ "items.seller_id": seller_id });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();

    return res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSellerByIdAdmin = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    const seller = await Seller.findOne({ seller_id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteSeller = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    const seller = await Seller.findOneAndDelete({ seller_id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seller deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const approveSeller = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    const seller = await Seller.findOne({ seller_id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    seller.status = "approved";
    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Seller approved successfully",
      data: seller,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    const seller = await Seller.findOne({ seller_id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    seller.status = "rejected";
    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Seller rejected successfully",
      data: seller,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
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
  approveSeller,
  rejectSeller,
};
