const express = require("express");
const {
  createAdmin,
  loginAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} = require("../Controllers/adminController");
const { auth, adminAuth } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/admin/login", loginAdmin);

router.post("/admins", auth, adminAuth, createAdmin);
router.get("/admins", auth, adminAuth, getAdmins);
router.get("/admins/:id", auth, adminAuth, getAdminById);
router.put("/admins/:id", auth, adminAuth, updateAdmin);
router.delete("/admins/:id", auth, adminAuth, deleteAdmin);

module.exports = router;
