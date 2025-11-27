const mongoose = require('mongoose');


async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database Error", error);
  }
}
 module.exports = connectDB;