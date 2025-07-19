const User = require("../models/User");
const Test = require("../models/Test");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const evaluateAnswer = require("../utils/evaluateSingleAnswer");

// -------------------------
// Submit Single Question
// -------------------------
exports.submitSingleQuestion = async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyAttempted = user.questionHistory.find(
      (entry) => entry.question.toString() === questionId
    );
    if (alreadyAttempted)
      return res.status(400).json({
        message: "You have already answered this question.",
      });

    const result = await evaluateAnswer(questionId, userAnswer);

    user.questionHistory.push({
      question: questionId,
      userAnswer,
      isCorrect: result.isCorrect,
      pointsEarned: result.score,
      attemptedAt: new Date(),
    });

    user.points += result.score;
    user.questionsAttempted += 1;
    if (result.isCorrect) user.correctQuestions += 1;

    await user.save();

    return res.status(200).json({
      message: "Question submitted successfully",
      isCorrect: result.isCorrect,
      score: result.score,
      feedback: result.feedback,
    });
  } catch (error) {
 //   console.error("❌ submitSingleQuestion Error:", error);
    return res.status(500).json({
      message: "Question submission failed",
      error: error.message,
    });
  }
};

// -------------------------
// Submit Test
// -------------------------
exports.submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const userId = req.user.id;

    const test = await Test.findById(testId).populate("questions");
    if (!test) return res.status(404).json({ message: "Test not found" });

    const user = await User.findById(userId);

    // Check if test already submitted
    const alreadySubmitted = user.testHistory.find(
      (entry) => entry.testId.toString() === testId.toString()
    );
    if (alreadySubmitted)
      return res.status(400).json({ message: "Test already submitted" });

    const questionHistory = [];
    let totalScore = 0;

    for (const question of test.questions) {
      const userAns = answers.find(
        (a) => a.questionId === question._id.toString()
      );
      if (!userAns) continue;

      const result = await evaluateAnswer(question._id, userAns.userAnswer);
      totalScore += result.score;

      questionHistory.push({
        question: question._id,
        userAnswer: userAns.userAnswer,
        isCorrect: result.isCorrect,
        pointsEarned: result.score,
        attemptedAt: new Date(),
      });

      // Optional: You may also push into user's general questionHistory if needed
    }

    user.testHistory.push({
      testId,
      answers: questionHistory,
      totalScore,
      submittedAt: new Date(),
    });

    user.points += totalScore;
    user.testAttempted += 1;
    user.questionsAttempted += questionHistory.length;
    user.correctQuestions += questionHistory.filter((q) => q.isCorrect).length;

    await user.save();

    return res.status(200).json({
      success: true,
      totalScore,
      answers: questionHistory,
    });
  } catch (err) {
   // console.error("❌ submitTest Error:", err);
    return res.status(500).json({ message: "Submission failed" });
  }
};

// -------------------------
// Submit Quiz
// -------------------------
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz ID and answers are required" });
    }

    const quiz = await Quiz.findById(quizId).populate({
      path:'questions',
      populate:{
        path:['options' , 'correctOption']
      }
    });
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const user = await User.findById(userId).populate(
      "quizHistory.answers.question"
    );

    const alreadySubmitted = user.quizHistory.find(
      (item) => item.quizId.toString() === quizId.toString()
    );
    if (alreadySubmitted) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz already submitted" });
    }

    let totalScore = 0;
    let evaluatedAnswers = [];

    for (const question of quiz.questions) {
      const userAns = answers.find(
        (a) => a.questionId?.toString() === question._id.toString()
      );

     

      if (!userAns) {
        continue;
      }

      let result = await evaluateAnswer(question, userAns.answer);

    

      evaluatedAnswers.push({
        question: question,
        isCorrect: result.isCorrect,
        score: result.score,
        feedback: result.feedback,
      });

      totalScore += result.score;
    }

    // Update user stats
    user.points = (user.points || 0) + totalScore;
    user.questionsAttempted =
      (user.questionsAttempted || 0) + evaluatedAnswers.length;
    user.correctQuestions =
      (user.correctQuestions || 0) +
      evaluatedAnswers.filter((a) => a.isCorrect).length;

    // Save attempt
    user.quizHistory.push({
      quizId: quiz._id,
      answers: evaluatedAnswers,
      score: totalScore,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score: totalScore,
      answers: evaluatedAnswers,
    });
  } catch (error) {
   // console.error("Error in submitQuiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: error.message,
    });
  }
};
