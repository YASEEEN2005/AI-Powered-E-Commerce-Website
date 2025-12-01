// seeder.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");

const productsFilePath = path.join(__dirname, "data", "products.json");

const importData = async () => {
  try {
    await connectDB();

    const productsData = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

    await Product.deleteMany();
    await Product.insertMany(productsData);

    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error("Error with data import:", error);
    process.exit(1);
  }
};

importData();
