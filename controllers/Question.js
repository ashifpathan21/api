const SubSection = require("../models/SubSection");
const Question = require("../models/Question");

// 🟢 Create Question (Only questionText Required)
exports.createQuestion = async (req, res) => {
	try {
		const { subSectionId, questionText  } = req.body;

		// Find the subsection
		const subSection = await SubSection.findById(subSectionId);
		if (!subSection) {
			return res.status(404).json({ message: "SubSection not found" });
		}

		// Create new question in the Question model (without options)
		const newQuestion = await Question.create({ questionText });

		// Add the question ID to the subsection
		subSection.questions.push(newQuestion._id);
		await subSection.save();

		res.status(201).json({ message: "Question added successfully", question: newQuestion });
	} catch (error) {
		res.status(500).json({ message: "Internal server error", error: error.message });
	}
};

// 🟡 Update Question
exports.updateQuestion = async (req, res) => {
	try {
		const { questionId, questionText } = req.body;

		// Find the question by ID
		const question = await Question.findById(questionId);
		if (!question) {
			return res.status(404).json({ message: "Question not found" });
		}

		// Update only questionText
		if (questionText) question.questionText = questionText;

		await question.save();

		res.status(200).json({ message: "Question updated successfully", question });
	} catch (error) {
		res.status(500).json({ message: "Internal server error", error: error.message });
	}
};

// 🔴 Delete Question
exports.deleteQuestion = async (req, res) => {
	try {
		const { subSectionId, questionId } = req.body;

		// Find the subsection
		const subSection = await SubSection.findById(subSectionId);
		if (!subSection) {
			return res.status(404).json({ message: "SubSection not found" });
		}

		// Remove the question ID from subsection
		subSection.questions = subSection.questions.filter(q => q.toString() !== questionId);
		await subSection.save();

		// Delete the question from Question model
		await Question.findByIdAndDelete(questionId);

		res.status(200).json({ message: "Question deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error", error: error.message });
	}
};
