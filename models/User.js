const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    userName: { type: String, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      default: "Student",
    },
    image: { type: String, required: true },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    courseProgress: [
      { type: mongoose.Schema.Types.ObjectId, ref: "courseProgress" },
    ],
    friendRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    friends: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "message" },
      },
    ],
    socketId: { type: String },
    active: { type: Boolean, default: true },
    token: { type: String, select: false },
    resetPasswordExpires: { type: Date },

    // ✅ Test and Question Tracking
    points: { type: Number, default: 0 },
    testAttempted: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    correctQuestions: { type: Number, default: 0 },

    // 🔍 Prevent duplicate test attempts
    quizHistory: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        answers: [
          {
            question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
            userAnswer: { type: String }, // text/numeric/optionId
            isCorrect: Boolean,
            pointsEarned: Number,
            attemptedAt: { type: Date, default: Date.now },
          },
        ],
        totalScore: Number,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    testHistory: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
        answers: [
          {
            question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
            userAnswer: { type: String },
            isCorrect: Boolean,
            pointsEarned: Number,
            attemptedAt: { type: Date, default: Date.now },
          },
        ],
        totalScore: Number,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    // 🔍 Prevent duplicate question attempts
    questionHistory: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        userAnswer: { type: String }, // text/numeric/optionId
        isCorrect: { type: Boolean },
        pointsEarned: { type: Number },
        attemptedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.user || mongoose.model("user", userSchema);
