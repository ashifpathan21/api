const Profile = require("../models/Profile")
const CourseProgress = require("../models/CouresProgress")
const mailSender = require("../utils/mailSender")
const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUpload")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration") ;
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollementEmail")

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
    lastName,
    userName,
    image,
    additionalDetails: {
      gender,
      contactNumber,
      dateOfBirth,
      collegeName,
      linkedinUrl,
      about,
    }} = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
      userName,
      image
    })
    await user.save()

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender
    profile.linkedinUrl = linkedinUrl
    profile.collegeName=collegeName
    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    //// console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    //// console.log(id)
    const user = await User.findById({ _id: id })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    })
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    await CourseProgress.deleteMany({ userId: id })
  } catch (error) {
    //// console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")

      .populate({
        path: "friendRequest",
        select: "-password -createdAt -updatedAt -__v",
      })

      .populate({
        path: "friends",
        populate: [
          {
            path: "user",
            select: "-password -createdAt -updatedAt -__v", // friend user details
          },
          {
            path: "chat", // assuming chat ID is stored
            select: "-__v", // you can modify this to populate messages too
          },
        ],
      })

      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
        },
      })

      .populate({
        path: "courseProgress",
        populate: {
          path: "completedVideos",
          populate: {
            path: "subSection",
          },
        },
      })

      .exec();

    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateDisplayPicture=async(req,res) =>{

  try{
    const displayPicture=req.files.displayPicture;
    const userId=req.user.id;
    const image =await uploadImageToCloudinary(
     displayPicture,
     process.env.FOLDER_NAME,
     1000,1000
    )
    //// console.log(image);
    const updatedProfile=await User.findByIdAndUpdate({_id:userId},
 {image:image.secure_url},
 {new:true})

 //// console.log("yaha pe hai aapki profile",updatedProfile);
 res.send({
     success: true,
     message: `Image Updated successfully`,
     data: updatedProfile,
   })
 } catch (error) {
   return res.status(500).json({
     success: false,
     message: error.message,
   
   })
}
}


exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    //// console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
} 



exports.enrollInCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID and User ID" })
    }

  

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }


    // Check if the user is an instructor
    const user = await User.findById(userId);
    if (user.accountType === "Instructor") {
      return res.status(400).json({
        success: false,
        message: "Instructors cannot enroll in any courses",
      });
    }

    // Check if the user is already enrolled in the course
    if (user.courses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "User is already enrolled in this course",
      });
    }


    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: userId,
      completedVideos: [],
    })

    // Enroll the user in the course
    user.courses.push(courseId);
    user.courseProgress.push(courseProgress._id)
    await user.save();

    // Add the user to the course's studentsEnroled list
    course.studentsEnrolled.push(userId);
    
    await course.save();

    const emailResponse = await mailSender(
      user.email,
      `Successfully Enrolled into ${course.courseName}`,
      courseEnrollmentEmail(
        course.courseName,
        `${user.firstName} ${user.lastName}`
      )
    )

    //// console.log("Email sent successfully: ", emailResponse.response)
   

    return res.status(200).json({
      success: true,
      message: "User enrolled in course successfully",
    });
  } catch (error) {
    //// console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
