const User = require("../Models/User");
const { generateToken } = require("../Middleware/authMiddleware");

// POST /api/user/session
// body: { user_id } 
const createUserSession = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "user_id is required" });
    }

    const user = await User.findOne({ user_id: Number(user_id) });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: "user",
    });

    return res.status(200).json({
      success: true,
      message: "User session created",
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error creating user session:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createUserSession,
};
