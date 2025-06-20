const Course = require("../models/Course")
const Category = require("../models/Category")
const mongoose = require('mongoose')
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUpload")
const CourseProgress = require("../models/CouresProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      status,
      thumbnail,
      instructions,
    } = req.body;

    //// console.log({ courseName, courseDescription, whatYouWillLearn, price, category, status, thumbnail, instructions });

    if (!courseName || !courseDescription || !whatYouWillLearn || !thumbnail || !category || !instructions) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }

    if (!status) status = "Draft";

    const instructorDetails = await User.findById(userId);
    if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      });
    }

    const categoryDetails = await Category.findOne({ name: category });
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price value",
      });
    }
    price = Number(price);

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
      thumbnail,
      status,
      instructions,
    });

    await User.findByIdAndUpdate(
      instructorDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    await Category.findByIdAndUpdate(
      categoryDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (error) {
    //// console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId , updates } = req.body
    
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    const {courseName , courseDescription , whatYouWillLearn , price , status , category , thumbnail , instructions} = updates

    if(courseName){
      //// console.log(courseName)
      course.courseName = courseName ;
    }
    if(courseDescription){
      course.courseDescription = courseDescription ;
    }
    if(whatYouWillLearn){
      course.whatYouWillLearn = whatYouWillLearn ;
    }
    if(price){
      course.courseName = price ;
    }
    if(category){
      const categ = await  Category.findOne({name:category});
 //// console.log(categ)
      course.category = categ._id ;
    }
 
    if(thumbnail){
      course.thumbnail = thumbnail
    }
    if(instructions){
      course.instructions = instructions
    }
    // Update only the fields that are present in the request body
   // for (const key in updates) {
     
        // if (key === "tag" || key === "instructions") {
        //   course[key] = JSON.parse(updates[key])
        // } else {
    //      course[key] = updates[key]
       // }
     
   // }
   course.status = updates.status
   //// console.log(updates.status)

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    //// console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" }
    )
    .populate({
      path: "instructor",
      populate: {
        path: "additionalDetails",
      },
    })
    .populate("category")
   .populate({
        path: "ratingAndReviews",
        options: { sort: { rating: -1 } }, // sorting inside populate
        populate: [
            {
                path: "user",
                select: "firstName lastName email image",
            },
            {
                path: "course",
                select: "courseName",
            },
        ],
    })
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
        // select: "videoUrl",
        populate:{
          path:'questions' ,
          populate:{
            path:["options" , 'correctOption']
          }
        }
      },
    })
    .exec()

    allCourses.map((course) => course.instructor.password = null) ;

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    //// console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}
// Get One Single Course Details
// exports.getCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()
//     // //// console.log(
//     //   "###################################### course details : ",
//     //   courseDetails,
//     //   courseId
//     // );
//     if (!courseDetails || !courseDetails.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     if (courseDetails.status === "Draft") {
//       return res.status(403).json({
//         success: false,
//         message: `Accessing a draft course is forbidden`,
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: courseDetails,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    const courses =  await Course.findById(courseId);
  

    const courseDetails = await Course.findOne({
      _id: courseId,
    }).populate('category')
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
     
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          populate:{
            path: 'questions',
          
            populate: [
              { path: "options" },
              { path: "correctOption" }
            ]  
          }
        },
      })
      .exec()

      //// console.log(courseDetails)

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    //// console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    //// console.log('course ................................................................\n', courseDetails)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 }).populate({
      path: "instructor",
      populate: {
        path: "additionalDetails",
      },
    })
    .populate("category")
    .populate("ratingAndReviews")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
        populate:{
          path: 'questions',
          populate: [
            { path: "options" },
            { path: "correctOption" }
          ]          
        }
      },
    })
    .exec()

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    //// console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body
//// console.log( 'course  ................................',courseId)
    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Pull the course ID from the user model
      await User.findByIdAndUpdate(course.instructor, {
        $pull: { courses: courseId },
      });

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    //// console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}







// Get Top 3 Courses by Student Enrollment
exports.getTopCourses = async (req, res) => {
  try {
    const topCourses = await Course.find({ status: "Published" })
      .sort({ studentsEnrolled: -1 })
      .limit(3)
      .populate("instructor")
      .populate("category")
      .exec();

    return res.status(200).json({
      success: true,
      data: topCourses,
    });
  } catch (error) {
    //// console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve top courses",
      error: error.message,
    });
  }
};



// Get Top Course of a Particular Instructor by Student Enrollment
exports.getTopCourseOfInstructor = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const topCourse = await Course.find({
      instructor: instructorId,
      status: "Published",
    })
    .sort({ studentsEnrolled: -1 })
    .limit(3)
    .populate("instructor")
    .populate("category")
    .exec();

    if (!topCourse) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this instructor",
      });
    }

    return res.status(200).json({
      success: true,
      data: topCourse,
    });
  } catch (error) {
    //// console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve top course",
      error: error.message,
    });
  }
};
