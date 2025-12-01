const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../Controllers/userController");

const router = express.Router();

router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/:user_id", getUserById);
router.put("/users/:user_id", updateUser);
router.delete("/users/:user_id", deleteUser);


module.exports = router;
