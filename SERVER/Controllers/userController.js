const User = require("../Models/User");

// CREATE – POST 
const createUser = async (req, res) => {
  try {
    const { name, email, phone, pinCode } = req.body;

    if (!name || !email || !phone || !pinCode) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.create({ name, email, phone, pinCode });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// READ ALL – GET
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// READ ONE – GET 
const getUserById = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const user = await User.findOne({ user_id });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// UPDATE – PUT 
const updateUser = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);
    const { name, email, phone, pinCode } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { user_id },
      { name, email, phone, pinCode },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE – DELETE 
const deleteUser = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const deletedUser = await User.findOneAndDelete({ user_id });

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
