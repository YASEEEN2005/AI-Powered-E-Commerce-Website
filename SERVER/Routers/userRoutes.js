const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByPhone,
} = require("../Controllers/userController");
const { auth, userAuth } = require("../Middleware/authMiddleware");
const router = express.Router();

router.post("/users", createUser);
router.get("/users", auth, getAllUsers);
router.get("/users/:user_id", auth, getUserById);
router.put("/users/:user_id", auth, updateUser);
router.delete("/users/:user_id", auth, deleteUser);
router.delete("/users/:user_id", auth, deleteUser);
router.get("/users/by-phone/:phone", getUserByPhone);


module.exports = router;
