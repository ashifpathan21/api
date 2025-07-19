const express = require("express");
const router = express.Router();
const {
  generateQuiz,
  getAllQuizzes,
} = require("../controllers/GenerateQuiz.js");
const { auth, isStudent } = require("../middlewares/auth");
const { submitQuiz } = require("../controllers/submission.js");

router.get("/get-all", auth, isStudent, getAllQuizzes);
router.post("/generate", auth, isStudent, generateQuiz);
router.post("/submit", auth, isStudent, submitQuiz);

module.exports = router;
