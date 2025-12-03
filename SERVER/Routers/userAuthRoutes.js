const express = require("express");
const { createUserSession } = require("../Controllers/userAuthController");

const router = express.Router();

router.post("/users/session", createUserSession);

module.exports = router;
