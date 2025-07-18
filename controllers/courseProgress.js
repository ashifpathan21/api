const mongoose = require("mongoose");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CouresProgress");
const Course = require("../models/Course");

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId, correctQuestions } = req.body;
  const userId = req.user.id;

  try {
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({ error: "Invalid subsection" });
    }

    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress not found",
      });
    }

    // Check if subsection is already marked completed
    const alreadyDone = courseProgress.completedVideos.find(
      (item) => item.subSection.toString() === subsectionId
    );

    if (alreadyDone) {
      return res.status(400).json({ error: "Subsection already completed" });
    }

    // Add new completed subsection with correctQuestions info
    courseProgress.completedVideos.push({
      subSection: subsectionId,
      correctQuestions: correctQuestions || [],
    });

    await courseProgress.save();

    return res.status(200).json({
      message: "Course progress updated successfully",
      completed: courseProgress.completedVideos.length,
    });
  } catch (error) {
    console.error("Update Course Progress Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



exports.getProgressPercentage = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    return res.status(400).json({ error: "Course ID not provided." });
  }

  try {
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    const totalSubsections = course.courseContent.reduce((acc, section) => {
      return acc + (section.subSection?.length || 0);
    }, 0);

    const completed = courseProgress?.completedVideos.length || 0;
    const progress = totalSubsections === 0 ? 0 : ((completed / totalSubsections) * 100).toFixed(2);

    res.status(200).json({
      progress: Number(progress),
      completed,
      total: totalSubsections,
    });
  } catch (error) {
    console.error("Progress Fetch Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
