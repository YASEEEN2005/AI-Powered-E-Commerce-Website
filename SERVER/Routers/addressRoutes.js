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

router.post("/address/add", auth, addAddress);
router.get("/address/user/:user_id", auth, getAddressesByUser);
router.get("/address/item/:id", auth, getAddressById);
router.put("/address/item/:id", auth,  updateAddress);
router.delete("/address/item/:id", auth,  deleteAddress);

module.exports = router;
