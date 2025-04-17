const Question = require("../models/Question");
const Option = require("../models/Option");
const SubSection = require("../models/SubSection");

// 🟢 Add Option to a Question
exports.addOption = async (req, res) => {
    try {
        const { questionId, optionText } = req.body;
        if (!questionId || !optionText) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const question = await Question.findById(questionId).populate("options");
        if (!question) return res.status(404).json({ message: "Question not found" });

        if (question.options?.length >= 4) {
            return res.status(400).json({ message: "A question can have only 4 options" });
        }

        if (question.options.some(opt => opt.options === optionText)) {
            return res.status(400).json({ message: "This option already exists" });
        }

        const newOption = await Option.create({ options: optionText });
        question.options.push(newOption._id);
        await question.save();

        res.status(201).json({ message: "Option added successfully", option: newOption });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 🟡 Update an Option
exports.updateOption = async (req, res) => {
    try {
        const { optionId, newOptionText } = req.body;
        if (!optionId || !newOptionText) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const option = await Option.findById(optionId);
        if (!option) return res.status(404).json({ message: "Option not found" });

        option.options = newOptionText;
        await option.save();

        res.status(200).json({ message: "Option updated successfully", option });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 🔴 Delete an Option
exports.deleteOption = async (req, res) => {
    try {
        const { questionId, optionId } = req.body;
        if (!questionId || !optionId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const question = await Question.findByIdAndUpdate(
            questionId,
            { $pull: { options: optionId } },
            { new: true }
        );

        if (!question) return res.status(404).json({ message: "Question not found" });

        await Option.findByIdAndDelete(optionId);
        res.status(200).json({ message: "Option deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Add Correct Option
exports.addCorrectOption = async (req, res) => {
    try {
        const { subSectionId, questionId, correctOption } = req.body;
        if (!subSectionId || !questionId || !correctOption) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) return res.status(404).json({ message: "SubSection not found" });

        if (!subSection.questions.includes(questionId)) {
            return res.status(404).json({ message: "Question not found in SubSection" });
        }

        const question = await Question.findById(questionId).populate("options");
        if (!question) return res.status(404).json({ message: "Question not found" });

        if (!question.options.some(opt => opt.options === correctOption)) {
            return res.status(400).json({ message: "Correct option must be one of the available options" });
        }

        const newCorrectOption = await Option.create({ options: correctOption });
        question.correctOption = newCorrectOption._id;
        await question.save();

        res.status(201).json({ message: "Correct option added successfully", correctOption: newCorrectOption });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Correct Option
exports.updateCorrectOption = async (req, res) => {
    try {
        const { subSectionId, questionId, newCorrectOption } = req.body;
        if (!subSectionId || !questionId || !newCorrectOption) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) return res.status(404).json({ message: "SubSection not found" });

        if (!subSection.questions.includes(questionId)) {
            return res.status(404).json({ message: "Question not found in SubSection" });
        }

        const question = await Question.findById(questionId).populate("options");
        if (!question) return res.status(404).json({ message: "Question not found" });

        if (!question.options.some(opt => opt.options === newCorrectOption)) {
            return res.status(400).json({ message: "New correct option must be one of the available options" });
        }

        const updatedOption = await Option.create({ options: newCorrectOption });
        question.correctOption = updatedOption._id;
        await question.save();

        res.status(200).json({ message: "Correct option updated successfully", correctOption: updatedOption });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Correct Option
exports.deleteCorrectOption = async (req, res) => {
    try {
        const { subSectionId, questionId } = req.body;
        if (!subSectionId || !questionId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) return res.status(404).json({ message: "SubSection not found" });

        if (!subSection.questions.includes(questionId)) {
            return res.status(404).json({ message: "Question not found in SubSection" });
        }

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        question.correctOption = null;
        await question.save();

        res.status(200).json({ message: "Correct option removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
