const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: [
      "Food",
      "Transport",
      "Entertainment",
      "Bills",
      "PersonalCare",
      "Other",
    ],
    required: true,
    unique: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
