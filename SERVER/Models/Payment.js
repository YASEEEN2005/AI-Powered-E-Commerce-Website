const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const paymentSchema = new mongoose.Schema(
  {
    payment_record_id: { type: Number, unique: true },

    user_id: {
      type: Number,
      required: true,
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

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed"],
      default: "created",
    },

    items: [
      {
        product_id: Number,
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
      },
    ],
  },
  { timestamps: true }
);

paymentSchema.plugin(AutoIncrementFactory, {
  id: "payment_id_counter",
  inc_field: "payment_record_id",
  start_seq: 1,
});

module.exports = mongoose.model("Payment", paymentSchema);
