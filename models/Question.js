const mongoose = require("mongoose");

// Question Schema
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Option" }],
    validate: {
      validator: function (v) {
        return v.length <= 4; // Ensure that options length does not exceed 4
      },
      message: "A question can have at most 4 options",
    },
  },
  correctOption: { type: mongoose.Schema.Types.ObjectId, ref: "Option" }, // Option reference
});

module.exports = mongoose.model('Question', questionSchema);

