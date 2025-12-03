require("dotenv").config();
const jwt = require("jsonwebtoken");

// generate token
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

//Basic auth middleware – checks any valid token
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, invalid token" });
  }
};

// Admin-only
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access only" });
  }
  next();
};

// Seller-only
const sellerAuth = (req, res, next) => {
  if (!req.user || req.user.role !== "seller") {
    return res
      .status(403)
      .json({ success: false, message: "Seller access only" });
  }
  next();
};

// Normal user-only
const userAuth = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res
      .status(403)
      .json({ success: false, message: "User access only" });
  }
  next();
};

module.exports = {
  generateToken,
  auth,
  adminAuth,
  sellerAuth,
  userAuth,
};
