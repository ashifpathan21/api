const Question = require("../models/Question");
const Option = require("../models/Option");
const SubSection = require("../models/SubSection");

// 🔰 Create Any Question
exports.createQuestion = async (req, res) => {
  try {
    const { subSectionId, questionText, questionType, options, correctOptionIndex, correctAnswer, points } = req.body;

    if (!subSectionId || !questionText || !questionType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) return res.status(404).json({ message: "SubSection not found" });

    let questionData = { questionText, questionType, points };

    if (questionType === "MCQ") {
      if (!Array.isArray(options) || options.length < 2 || options.length > 4)
        return res.status(400).json({ message: "2-4 options required for MCQ" });

      if (correctOptionIndex < 0 || correctOptionIndex >= options.length)
        return res.status(400).json({ message: "Invalid correctOptionIndex" });

      const createdOptions = await Option.insertMany(options.map(opt => ({ options: opt })));
      questionData.options = createdOptions.map(o => o._id);
      questionData.correctOption = createdOptions[correctOptionIndex]._id;

    } else if (questionType === "NUMERIC" || questionType === "WRITTEN") {
      if (!correctAnswer) return res.status(400).json({ message: "Correct answer required" });
      questionData.correctAnswer = correctAnswer.trim();
    }

    const newQuestion = await Question.create(questionData);
    subSection.questions.push(newQuestion._id);
    await subSection.save();

    res.status(201).json({ message: "Question created", question: newQuestion });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.updateQuestion = async (req, res) => {
  try {
    const { questionId, questionText, questionType, options, correctOptionIndex, correctAnswer, points } = req.body;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    question.questionText = questionText || question.questionText;
    question.questionType = questionType || question.questionType;
    question.points = points || question.points;

    if (questionType === "MCQ") {
      await Option.deleteMany({ _id: { $in: question.options } });

      const newOptions = await Option.insertMany(options.map(opt => ({ options: opt })));
      question.options = newOptions.map(o => o._id);
      question.correctOption = newOptions[correctOptionIndex]._id;

    } else if (questionType === "NUMERIC" || questionType === "WRITTEN") {
      question.correctAnswer = correctAnswer?.trim();
      question.options = [];
      question.correctOption = null;
    }

    await question.save();
    res.status(200).json({ message: "Question updated", question });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId, subSectionId } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    await Option.deleteMany({ _id: { $in: question.options } });
    await Question.findByIdAndDelete(questionId);
    await SubSection.findByIdAndUpdate(subSectionId, { $pull: { questions: questionId } });

    res.status(200).json({ message: "Question deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
