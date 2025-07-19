const Question = require("../models/Question");
const aiService = require("./ai.service");

module.exports = async function evaluateSingleAnswer(questionId, userAnswer) {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Question not found");
   

   if (question.questionType === "MCQ") {
   const isCorrect =
     question.correctOption?.toString() === userAnswer?._id?.toString() ||
     question.correctOption?.toString() === userAnswer ;

    return {
      isCorrect,
      score: isCorrect ? question.points : 0,
      feedback: isCorrect ? "Correct!" : "Incorrect answer"
    };
  }

  // Handle NUMERIC question
  if (question.questionType === "NUMERIC") {
    const isCorrect = question.correctAnswer.trim() === userAnswer.trim();
    return {
      isCorrect,
      score: isCorrect ? question.points : 0,
      feedback: isCorrect ? "Correct!" : "Incorrect answer"
    };
  }

  // Handle WRITTEN question
  if (question.questionType === "WRITTEN") {
    const prompt = `
You are an AI evaluator. Score the student answer out of ${question.points} marks.

Question: ${question.questionText}
Correct Answer: ${question.correctAnswer}
Student's Answer: ${userAnswer}

Respond strictly in this JSON format (no markdown, no explanation):
{
  "score": <number>,
  "feedback": "<brief feedback like Great || Good || Too Close only >"
}
`;

    const response = await aiService(prompt, "default");

    // ✅ Clean JSON string from code blocks, etc.
    const jsonString = response
      .replace(/```json|```/g, "")   // remove markdown code blocks if any
      .trim();

    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (err) {
   //   console.error("Failed to parse AI response:", jsonString);
      throw new Error("AI response was not valid JSON");
    }

    const { score, feedback } = result;
    return {
      isCorrect: score >= Math.floor(question.points / 2), // Pass threshold
      score,
      feedback
    };
  }

  throw new Error("Unsupported question type");
};
