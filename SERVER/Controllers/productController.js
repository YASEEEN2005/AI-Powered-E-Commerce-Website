const Product = require("../Models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error getting products:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await Product.findOne({ id });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error getting product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { id, name, category, description, price, brand, rating, stock, images } =
      req.body;

    if (!id || !name || !category || !description || !price || !brand) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    const product = await Product.create({
      id,
      name,
      category,
      description,
      price,
      brand,
      rating,
      stock,
      images,
    });

    return res
      .status(201)
      .json({ success: true, message: "Product created", data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deletedProduct = await Product.findOneAndDelete({ id });

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
