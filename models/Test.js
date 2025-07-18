const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    }
  ],
  totalMarks: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Test", testSchema);
