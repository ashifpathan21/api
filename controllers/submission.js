const User = require("../models/User");
const Test = require("../models/Test");
const Question = require("../models/Question");
const evaluateAnswer = require("../utils/evaluateSingleAnswer");

exports.submitTest = async (req, res) => {
  try {
    const { userId, testId, answers } = req.body;
    // answers: [{ questionId, userAnswer }]

    const user = await User.findById(userId);
    const test = await Test.findById(testId).populate("questions");

    if (!user || !test) return res.status(404).json({ message: "User or Test not found" });

    // ❌ Prevent re-attempt of test
    const alreadyAttempted = user.testHistory.find(
      (entry) => entry.test.toString() === test._id.toString()
    );
    if (alreadyAttempted) {
      return res.status(400).json({ message: "You have already attempted this test." });
    }

    let totalScore = 0;
    let correctCount = 0;
    const attemptedQuestions = [];

    for (const { questionId, userAnswer } of answers) {
      const alreadyAttemptedQuestion = user.questionHistory.find(
        (entry) => entry.question.toString() === questionId
      );
      if (alreadyAttemptedQuestion) continue;

      const result = await evaluateAnswer(questionId, userAnswer); // uses aiService internally

      // Save individual question attempt
      user.questionHistory.push({
        question: questionId,
        userAnswer,
        isCorrect: result.isCorrect,
        pointsEarned: result.score,
      });

      totalScore += result.score;
      if (result.isCorrect) correctCount++;

      attemptedQuestions.push({
        questionId,
        isCorrect: result.isCorrect,
        userAnswer,
        score: result.score,
        feedback: result.feedback,
      });
    }

    // Save test attempt in user history
    user.testHistory.push({
      test: test._id,
      score: totalScore,
      outOf: test.totalMarks,
    });

    // Update global stats
    user.points += totalScore;
    user.testAttempted += 1;
    user.questionsAttempted += attemptedQuestions.length;
    user.correctQuestions += correctCount;

    await user.save();

    res.status(200).json({
      message: "Test submitted successfully",
      test: test.title,
      totalScore,
      outOf: test.totalMarks,
      correctAnswers: correctCount,
      attemptedQuestions,
    });

  } catch (error) {
    console.error("Submit Test Error:", error.message);
    res.status(500).json({ message: "Test submission failed", error: error.message });
  }
};




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
      return res.status(400).json({ message: "You have already answered this question." });

    // 🧠 Evaluate the answer based on type
    const result = await evaluateAnswer(questionId, userAnswer);

    // ⬇️ Save to user history
    user.questionHistory.push({
      question: questionId,
      userAnswer,
      isCorrect: result.isCorrect,
      pointsEarned: result.score,
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
    console.error("Submit Error:", error);
    return res.status(500).json({
      message: "Question submission failed",
      error: error.message,
    });
  }
};
