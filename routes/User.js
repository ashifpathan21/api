// Import the required modules
const express = require("express")
const router = express.Router() ;

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendotp,
  checkUsernameAvailability,
  changePassword,
  getUserDetailsByUserId,
  addFriend ,
  rejectFriendRequest  ,
  acceptFriendRequest 
} = require("../controllers/Auth")

//for ai 
const {
  getReview
} = require('../controllers/ai.controllers.js')

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login)

router.post('/support' , getReview) ;

//to check availability of user 
router.post('/username' , checkUsernameAvailability)

//to get the user by userName ;
router.post('/find-friend' ,  auth , getUserDetailsByUserId) ;

//send friend request 
router.post('/add-friend' ,  auth , addFriend) ;
//accept friend request 
router.post('/add-friend' ,  auth , acceptFriendRequest) ;
//reject friend request 
router.post('/add-friend' ,  auth , rejectFriendRequest) ;

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = router
