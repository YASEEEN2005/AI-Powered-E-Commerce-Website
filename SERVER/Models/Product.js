const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const productSchema = new mongoose.Schema(
  {
    product_id: { type: Number, unique: true },
    seller_id: { type: Number, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    rating: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.plugin(AutoIncrement, {
  id: "product_id_counter",
  inc_field: "product_id",
  start_seq: 1,
});

module.exports = mongoose.model("Product", productSchema);
