const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const adminSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
  },
  { timestamps: true }
);

adminSchema.plugin(AutoIncrementFactory, {
  id: "admin_id_counter",
  inc_field: "id",
  start_seq: 1,
});

module.exports = mongoose.model("Admin", adminSchema);
