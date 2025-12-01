const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const cartItemSchema = new mongoose.Schema(
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
      default: 1,
    },
    image: {
      type: String,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    cart_id: { type: Number, unique: true },

    user_id: {
      type: Number,
      required: true,
    },

    items: [cartItemSchema],

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
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
  },
  { timestamps: true }
);

cartSchema.plugin(AutoIncrementFactory, {
  id: "cart_id_counter",
  inc_field: "cart_id",
  start_seq: 1,
});

module.exports = mongoose.model("Cart", cartSchema);
