require("dotenv").config();
const mongoose = require("mongoose");

const DB_URI = process.env.DB_URI;

const connectToDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Database connection successful");
  } catch (error) {
    console.error("Getting error while conneting to DB", error);
    process.exit(1);
  }
};

module.exports = connectToDB;
