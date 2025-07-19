const User = require("../models/User");
const Course = require("../models/Course");

exports.getSuggestions = async (req, res) => {
  const userId = req.user.id;

  try {
    const currentUser = await User.findById(userId)
      .populate("friends.user")
      .populate("friendRequest");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ------------------------------
    // 🧠 Friend Suggestions
    // ------------------------------
    const excludedUsers = new Set([
      userId,
      ...currentUser.friends.map((f) => f.user._id.toString()),
      ...currentUser.friendRequest.map((id) => id.toString()),
    ]);

  const friendSuggestions = await User.find({
  _id: { $nin: Array.from(excludedUsers) },
  accountType: "Student",
})
.select("-password  -createdAt -updatedAt -__v")
.limit(5);  // ✅ Limiting results to 5

    // ------------------------------
    // 📚 Course Suggestions
    // ------------------------------
    const enrolledCourseIds = currentUser.courses.map((c) => c.toString());

    const enrolledCourses = await Course.find({
      _id: { $in: enrolledCourseIds },
    }).select("category");

    const enrolledCategories = [...new Set(enrolledCourses.map((c) => c.category.toString()))];

    const courseSuggestions = await Course.find({
      _id: { $nin: enrolledCourseIds },
      category: { $in: enrolledCategories },
      status: "Published",
    })
      .populate("instructor", "firstName lastName")
      .select("courseName thumbnail instructor price")
      .limit(5);

    res.status(200).json({
      friendSuggestions,
      courseSuggestions,
    });
  } catch (error) {
   // console.error("Suggestion Fetch Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
