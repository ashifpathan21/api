const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    }
  ],
  messages: [
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      isSeen: {
        type: Boolean,
        default: false
      }
    }
  ]
});

module.exports = mongoose.models.message || mongoose.model("message", messageSchema);
