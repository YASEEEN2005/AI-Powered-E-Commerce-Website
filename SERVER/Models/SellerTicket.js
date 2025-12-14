const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const sellerTicketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: Number,
      unique: true,
    },

    seller_id: {
      type: Number,
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["orders", "products", "payments", "account", "other"],
      required: true,
    },

    order_id: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "closed"],
      default: "open",
    },

    admin_reply: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

sellerTicketSchema.plugin(AutoIncrementFactory, {
  id: "seller_ticket_id_counter",
  inc_field: "ticket_id",
  start_seq: 1000,
});

module.exports = mongoose.model("SellerTicket", sellerTicketSchema);
