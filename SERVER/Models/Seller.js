const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const sellerSchema = new mongoose.Schema(
  {
    seller_id: {
      type: Number,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    shop_name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    bank_name: {
      type: String,
      required: true,
    },

    account_number: {
      type: String,
      required: true,
    },

    ifsc_code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

sellerSchema.plugin(AutoIncrementFactory, {
  id: "seller_id_counter",
  inc_field: "seller_id",
  start_seq: 1,
});

module.exports = mongoose.model("Seller", sellerSchema);
