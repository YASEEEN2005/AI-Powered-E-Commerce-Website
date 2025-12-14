const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const contactSchema = new mongoose.Schema(
  {
    contact_id: {
      type: Number,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

contactSchema.plugin(AutoIncrementFactory, {
  id: "contact_id_counter",
  inc_field: "contact_id",
  start_seq: 1,
});

module.exports = mongoose.model("ContactMessage", contactSchema);
