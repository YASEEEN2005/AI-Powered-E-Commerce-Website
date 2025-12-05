const express = require("express");
const router = express.Router();

const {
  addAddress,
  getAddressesByUser,
  getAddressById,
  updateAddress,
  deleteAddress,
} = require("../Controllers/addressController");
const { auth, userAuth } = require("../Middleware/authMiddleware");

router.post("/address/add", auth, userAuth, addAddress);
router.get("/address/user/:user_id", auth, getAddressesByUser);
router.get("/address/item/:id", auth, userAuth, getAddressById);
router.put("/address/item/:id", auth, userAuth, updateAddress);
router.delete("/address/item/:id", auth, userAuth, deleteAddress);

module.exports = router;
