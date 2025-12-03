const express = require("express");
const connectDB = require("./config/dbConnect");
const app = express();
const router = require("./Routers/userRoutes");
const productRoutes = require("./Routers/productRoutes");
const adminRoutes = require("./Routers/adminRoutes");
const cartRoutes = require("./Routers/cartRoutes");
const paymentRoutes = require("./Routers/paymentRoutes");
const orderRoutes = require("./Routers/orderRoutes");
const wishlistRoutes = require("./Routers/wishlistRoutes");
const sellerRoutes = require("./Routers/sellerRoutes");
const userAuthRoutes = require("./Routers/userAuthRoutes");
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
app.use("/api", paymentRoutes);
app.use("/api", orderRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", sellerRoutes);
app.use("/api", userAuthRoutes);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
