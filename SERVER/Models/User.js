const mongoose = require("mongoose");
const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema(
  {
    user_id: { type: Number, unique: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    pinCode: { type: Number, required: true }
  },
  { timestamps: true }
);

userSchema.plugin(AutoIncrementFactory, {
  inc_field: "user_id",
  start_seq: 1,
});

module.exports = mongoose.model("User", userSchema);
