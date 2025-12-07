const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: Number,
      unique: true,
    },

    user_id: {
      type: Number,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },

    subtotal: {
      type: Number,
      required: true,
    },
    gst_amount: {
      type: Number,
      required: true,
      default: 0,
    },
    platform_fee: {
      type: Number,
      required: true,
      default: 10,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    order_status: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled", "returned", "refunded"],
      default: "placed",
    },

    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      default: null,
    },

    shipping_address: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

orderSchema.plugin(AutoIncrementFactory, {
  id: "order_id_counter",
  inc_field: "order_id",
  start_seq: 1,
});

module.exports = mongoose.model("Order", orderSchema);
