const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const wishlistItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    wishlist_id: {
      type: Number,
      unique: true,
    },

    user_id: {
      type: Number,
      required: true,
    },

    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

wishlistSchema.plugin(AutoIncrementFactory, {
  id: "wishlist_id_counter",
  inc_field: "wishlist_id",
  start_seq: 1,
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
