const express = require("express");
const connectDB = require("./config/dbConnect");
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 4000;

connectDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
