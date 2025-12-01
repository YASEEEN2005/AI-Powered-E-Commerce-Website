const express = require("express");
const connectDB = require("./config/dbConnect");
const app = express();
const router = require('./Routers/userRoutes')
require('dotenv').config();

const PORT = process.env.PORT || 4000;
app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use('/api',router)


app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
