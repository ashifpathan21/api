// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
  getTopCourseOfInstructor
} = require("../controllers/Course")

//questions 
const {
  createQuestion ,
  updateQuestion ,
  deleteQuestion
} = require('../controllers/Question')

//options
const {
  addOption, 
  updateOption ,
  deleteOption ,
  addCorrectOption ,
  updateCorrectOption ,
  deleteCorrectOption
} = require('../controllers/Option')


// Categories Controllers Import
const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category")

// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section")

// Sub-Sections Controllers Import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection")

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview")

const {
  updateCourseProgress
} = require("../controllers/courseProgress");

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)


router.post('/subsection/addCorrectOption' , auth , isInstructor , addCorrectOption)
router.post('/subsection/updateCorrectOption' , auth , isInstructor , updateCorrectOption)
router.post('/subsection/deleteCorrectOption' , auth , isInstructor , deleteCorrectOption)

//add question 
router.post('/subsection/addQuestion' , auth , isInstructor , createQuestion);
//update questuion
router.post('/subsection/updateQuestion' , auth , isInstructor , updateQuestion) ;
//delete Question 
router.post('/subsection/deleteQuestion' , auth  , isInstructor , deleteQuestion) ;

//add option 
router.post('/subsection/addOption' , auth , isInstructor , addOption);
router.post('/subsection/updateOption' , auth , isInstructor , updateOption);
router.post('/subsection/deleteOption' , auth , isInstructor , deleteOption);


// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
router.get("/getInstructorTopCourses", auth, isInstructor, getTopCourseOfInstructor)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router