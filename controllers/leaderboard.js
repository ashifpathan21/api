const User = require("../models/User");
const Profile = require("../models/Profile");

exports.getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Get current user's profile
    const user = await User.findById(userId).populate({
      path: "additionalDetails",
      select: "collegeName",
    });

    if (!user ) {
      return res.status(404).json({ success: false, message: "User" });
    }

    const userCollege = user?.additionalDetails?.collegeName;

    // Step 2: Global leaderboard (students only)
    const globalLeaderboard = await User.find({ accountType: "Student" })
      .select("firstName lastName userName courses correctQuestions friends email points image additionalDetails")
      .sort({ points: -1 })
      .populate({
        path: "additionalDetails",
        select: "collegeName linkedinUrl",
      });
     
      
    // Step 3: College leaderboard (students only, same college)
    const collegeProfileIds = await Profile.find({
      collegeName: userCollege,
    }).select("_id");

    const profileIdList = collegeProfileIds.map((p) => p._id);

    const collegeLeaderboard = await User.find({
      accountType: "Student",
      additionalDetails: { $in: profileIdList },
    })
      .select("firstName lastName userName courses correctQuestions friends email points image additionalDetails")
      .sort({ points: -1 })
      .populate({
        path: "additionalDetails",
        select: "collegeName linkedinUrl",
      });

    res.status(200).json({
      success: true,
      globalLeaderboard,
      collegeLeaderboard,
    });
  } catch (error) {
  //  console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
