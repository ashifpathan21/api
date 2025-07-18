const Test = require("../models/Test");
const Course = require("../models/Course");
const Question = require("../models/Question");

// ✅ Create Test
exports.createTest = async (req, res) => {
  try {
    const { courseId, title, description, questions = [] } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // 🔢 Calculate totalMarks from question points
    let totalMarks = 0;
    const questionDocs = await Question.find({ _id: { $in: questions } });
    questionDocs.forEach(q => {
      totalMarks += q.points || 0;
    });

    const newTest = await Test.create({
      title,
      description,
      questions,
      totalMarks,
      course: courseId
    });

    course.tests.push(newTest._id);
    await course.save();

    res.status(201).json({ message: "Test created", test: newTest });
  } catch (error) {
    res.status(500).json({ message: "Failed to create test", error: error.message });
  }
};

// 🟡 Update Test
exports.updateTest = async (req, res) => {
  try {
    const { testId, title, description, questions } = req.body;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    if (title) test.title = title;
    if (description) test.description = description;

    if (Array.isArray(questions)) {
      test.questions = questions;

      // 🔢 Recalculate totalMarks
      let totalMarks = 0;
      const questionDocs = await Question.find({ _id: { $in: questions } });
      questionDocs.forEach(q => {
        totalMarks += q.points || 0;
      });
      test.totalMarks = totalMarks;
    }

    await test.save();

    res.status(200).json({ message: "Test updated", test });
  } catch (error) {
    res.status(500).json({ message: "Failed to update test", error: error.message });
  }
};

// 🔴 Delete Test
exports.deleteTest = async (req, res) => {
  try {
    const { testId, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.tests = course.tests.filter(tid => tid.toString() !== testId);
    await course.save();

    await Test.findByIdAndDelete(testId);

    res.status(200).json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete test", error: error.message });
  }
};
