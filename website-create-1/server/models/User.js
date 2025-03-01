const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["Instructor", "Student"],
    required: true,
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdditionalDetails", // Assuming there's an AdditionalDetails model
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);