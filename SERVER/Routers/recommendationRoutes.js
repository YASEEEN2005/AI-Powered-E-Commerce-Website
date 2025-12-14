const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/authMiddleware");
const {
  getPersonalizedRecommendations,
} = require("../Controllers/recommendationController");

router.get("/recommend/:user_id", auth, getPersonalizedRecommendations);

module.exports = router;
