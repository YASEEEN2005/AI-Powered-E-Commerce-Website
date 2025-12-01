const express = require("express");
const {
  createAdmin,
  loginAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} = require("../Controllers/adminController");

const router = express.Router();

router.post("/admin/login", loginAdmin);

router.post("/admins", createAdmin);
router.get("/admins", getAdmins);
router.get("/admins/:id", getAdminById);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

module.exports = router;
