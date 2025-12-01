const express = require("express");
const connectDB = require("./config/dbConnect");
const app = express();
const router = require("./Routers/userRoutes");
const productRoutes = require("./Routers/productRoutes");
const adminRoutes = require("./Routers/adminRoutes");
const cartRoutes = require("./Routers/cartRoutes");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api", router);
app.use("/api", productRoutes);
app.use("/api", adminRoutes);
app.use("/api", cartRoutes);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
