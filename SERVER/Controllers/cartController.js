const Cart = require("../Models/Cart");
const User = require("../Models/User");
const Product = require("../Models/Product");

// helper: calculate subtotal, gst, platform fee, total
const calculateTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const gst = Number((subtotal * 0.18).toFixed(2));
  const platform_fee = items.length > 0 ? 10 : 0;
  const total = subtotal + gst + platform_fee;

  return { subtotal, gst, platform_fee, total };
};

// POST /api/cart/add
// body: { user_id, product_id, quantity }
const addToCart = async (req, res) => {
  try {
    let { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and product_id are required",
      });
    }

    user_id = Number(user_id);
    product_id = Number(product_id);
    quantity = Number(quantity) || 1;

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

    let cart = await Cart.findOne({ user_id });

    if (!cart) {
      const itemSubtotal = product.price * quantity;

      const items = [
        {
          product_id: product.product_id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0] || "",
          subtotal: itemSubtotal,
        },
      ];

      const totals = calculateTotals(items);

      cart = await Cart.create({
        user_id,
        items,
        totalAmount: totals.total,
        gst_amount: totals.gst,
        platform_fee: totals.platform_fee,
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product_id === product_id
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].subtotal =
          cart.items[existingItemIndex].price *
          cart.items[existingItemIndex].quantity;
      } else {
        cart.items.push({
          product_id: product.product_id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0] || "",
          subtotal: product.price * quantity,
        });
      }

      const totals = calculateTotals(cart.items);
      cart.totalAmount = totals.total;
      cart.gst_amount = totals.gst;
      cart.platform_fee = totals.platform_fee;

      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET /api/cart/:user_id
const getCartByUser = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const cart = await Cart.findOne({ user_id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: {
          user_id,
          items: [],
          totalAmount: 0,
          gst_amount: 0,
          platform_fee: 0,
        },
      });
    }

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// PUT /api/cart/item
// body: { user_id, product_id, quantity }
const updateCartItem = async (req, res) => {
  try {
    let { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || quantity == null) {
      return res.status(400).json({
        success: false,
        message: "user_id, product_id and quantity are required",
      });
    }

    user_id = Number(user_id);
    product_id = Number(product_id);
    quantity = Number(quantity);

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product_id === product_id
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
    }

    const totals = calculateTotals(cart.items);
    cart.totalAmount = totals.total;
    cart.gst_amount = totals.gst;
    cart.platform_fee = totals.platform_fee;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE /api/cart/item
// body: { user_id, product_id }
const removeCartItem = async (req, res) => {
  try {
    let { user_id, product_id } = req.body;

    user_id = Number(user_id);
    product_id = Number(product_id);

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.product_id !== product_id);

    const totals = calculateTotals(cart.items);
    cart.totalAmount = totals.total;
    cart.gst_amount = totals.gst;
    cart.platform_fee = totals.platform_fee;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE /api/cart/:user_id  -> clear cart
const clearCart = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.gst_amount = 0;
    cart.platform_fee = 0;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCartByUser,
  updateCartItem,
  removeCartItem,
  clearCart,
};
