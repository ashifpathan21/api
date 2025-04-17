const mongoose = require("mongoose")

const courseProgress = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  completedVideos: [
    {
      subSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
      },
      correctQuestions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      ],
    },
  ],
})

module.exports = mongoose.model("courseProgress", courseProgress)