const Question = require("../models/Question");
const User = require("../models/User");
const Option = require("../models/Option");
const Quiz = require("../models/Quiz");
const generateQuestionsViaAI = require("../utils/generateQuestionsViaAI");



// controllers/quizController.js



exports.getAllQuizzes = async (req, res) => {
  try {
    const { topic, difficulty, questionType, numberOfQuestions } = req.query;

    const filter = {};

    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;

    let quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .limit(numberOfQuestions ? parseInt(numberOfQuestions) : 20)
      .populate({
        path:'questions',
        populate:{
          path:['options' , 'correctOption']
        }
      }) // default 20 quizzes

    return res.status(200).json({
      success: true,
      message: "Quizzes fetched successfully",
      data: quizzes,
    });
  } catch (error) {
  ///  console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};





function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}




exports.generateQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, difficulty, numberOfQuestions, questionType } = req.body;

    // Step 1: Get user's previously attempted question IDs
    const user = await User.findById(userId).populate(
      "questionHistory.question"
    );
    const attemptedIds = new Set(
      user.questionHistory.map((entry) => entry.question._id.toString())
    );

    const finalQuestions = [];

    // Step 2: Reuse questions already available but not attempted by the user
    const existingQuestions = await Question.find({
      topic: { $regex: new RegExp(`^${escapeRegExp(topic)}$`, "i") },
      difficulty,
      ...(questionType !== "MIXED" && { questionType }),
    });

    for (const question of existingQuestions) {
      if (!attemptedIds.has(question._id.toString())) {
        finalQuestions.push(question);
        if (finalQuestions.length >= numberOfQuestions) break;
      }
    }

    // Step 3: Generate remaining questions via AI if needed
    const remaining = numberOfQuestions - finalQuestions.length;

    if (remaining > 0) {
      const aiGenerated = await generateQuestionsViaAI({
        topic,
        difficulty,
        numberOfQuestions: remaining,
        questionType,
      });

      for (const q of aiGenerated) {
        const escapedText = escapeRegExp(q.questionText.trim().toLowerCase());
        const existing = await Question.findOne({
          questionText: new RegExp(`^${escapedText}$`, "i"),
        });

        if (existing && attemptedIds.has(existing._id.toString())) continue;
        if (existing) {
          finalQuestions.push(existing);
          continue;
        }

        let optionIds = [];
        let correctOptionId = null;

        if (q.questionType === "MCQ" && Array.isArray(q.options)) {
          for (const optText of q.options) {
            const opt = await Option.create({ options: optText });
            optionIds.push(opt._id);
          }
          correctOptionId = optionIds[q.correctOptionIndex];
        }

        const newQuestion = await Question.create({
          questionText: q.questionText,
          questionType: q.questionType,
          options: optionIds,
          correctOption: correctOptionId,
          correctAnswer: q.correctAnswer,
          aiFeedback: q.aiFeedback || "",
          points: q.points || 1,
          topic,
          difficulty,
          source: "AI_QUIZ",
        });

        finalQuestions.push(newQuestion);
      }
    }

    // Step 4: Save Quiz reference
    const newQuiz = await Quiz.create({
      title: `${topic} | ${difficulty} | ${questionType}`,
      topic,
      difficulty,
      numberOfQuestions: finalQuestions.length,
      questionType,
      questions: finalQuestions.map((q) => q._id),
      generatedBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: `${finalQuestions.length} questions ready.`,
      quizId: newQuiz._id,
      quiz: finalQuestions,
    });
  } catch (err) {
  //  console.error("❌ Error generating quiz:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while generating quiz",
    });
  }
};
