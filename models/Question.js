const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["MCQ", "NUMERIC", "WRITTEN"],
    required: true,
  },
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: "Option" }], // MCQ
  correctOption: { type: mongoose.Schema.Types.ObjectId, ref: "Option" }, // MCQ
  correctAnswer: { type: String }, // NUMERIC or WRITTEN
  aiFeedback: { type: String }, // WRITTEN
  points: { type: Number, default: 1 },
  source: {
    type: String,
    enum: ["COURSE", "AI_QUIZ"],
    default: "COURSE",
  },
});

module.exports = mongoose.model("Question", questionSchema);
