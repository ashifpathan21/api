const aiService = require('../utils/ai.service');
const Question = require("../models/Question");


exports.getReview = async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ message: "Input is required" });
  }

  try {
    const response = await aiService(input, "review"); // 📌 type = review
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ message: "AI service failed", error: error.message });
  }
};




exports.evaluateAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;
    const question = await Question.findById(questionId);

    if (!question) return res.status(404).json({ message: "Question not found" });

    if (question.questionType === "NUMERIC") {
      const isCorrect = question.correctAnswer.trim() === userAnswer.trim();
      return res.status(200).json({
        score: isCorrect ? question.points : 0,
        message: isCorrect ? "Correct!" : "Incorrect answer"
      });
    }

    if (question.questionType === "WRITTEN") {
      const prompt = `
You are an AI evaluator. Score the student answer out of ${question.points} marks.

Question: ${question.questionText}
Correct Answer: ${question.correctAnswer}
Student's Answer: ${userAnswer}

Respond strictly in JSON:
{
  "score": 0-${question.points},
  "feedback": "brief explanation of correctness"
}
`;

      const response = await aiService(prompt, "default"); // 📌 type = default
      const { score, feedback } = JSON.parse(response);

      question.aiFeedback = feedback;
      await question.save();

      return res.status(200).json({ score, feedback });
    }

    res.status(400).json({ message: "Only NUMERIC and WRITTEN types supported" });

  } catch (error) {
   // console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};
