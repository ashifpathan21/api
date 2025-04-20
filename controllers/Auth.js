
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const {otpTemplate } = require('../mail/templates/emailVerificationTemplate.js')
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
  try { 
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      userName  ,  
      otp,
    } = req.body
    // Check if All Details are there or not
   
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !otp
    ) {
      return res.status(403).sen({
        success: false,
        message: "All Fields are required",
      })
    }
   

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)

    if (response.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    } else if (otp !== response[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

   

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender:'MALE',
      dateOfBirth: '',
      about: '',
      contactNumber: '',
      collegeName: ''
    })
    // .log("profile ",profileDetails)
    const user = await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      })


    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }
   return res.cookie("token", token, options).status(200).json({
      success: true,
      user,
      token,
      message: "User registered successfully",
    })
  } catch (error) {
    //console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body
     
    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails").exec()

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )

      // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Email or Password is incorrect`,
      })
    }
  } catch (error) {
    //console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });

    // If user found with provided email
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    // Generate a 6-digit OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Ensure OTP is unique
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    // Save OTP to the database
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    //console.log("OTP Body", otpBody);

   
   

    // Respond with success
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
    });
  } catch (error) {
    //console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      //console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      //console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    //console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}



// Controller to check if username is available
exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { userName } = req.body

    // Check if userName is provided
    if (!userName) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      })
    }

    // Check if userName already exists
    const existingUser = await User.findOne({ userName })
    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "Username is already taken",
      })
    }

    // If userName is available
    return res.status(200).json({
      success: true,
      message: "Username is available",
    })
  } catch (error) {
    //console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while checking username availability",
      error: error.message,
    })
  }
}

exports.getUserDetailsByUserId = async (req , res ) => {
  try {
 
    const {userName} = req.body ;
    //console.log('userName' , userName ,'\n\n')
    if(!userName){
      return res.status(400).json({
        success: false,
        message: "Username is required",
      })
    }

    // Ensure userName starts with the provided letter and exclude instructors
    const userDetails = await User.find({ 
      userName: { $regex: `^${userName}`, $options: "i" }, 
      role: { $ne: "Instructor" } // Exclude users with role "Instructor"
      })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .limit(7) // Limit the results to 5-7 users
      .select("firstName userName additionalDetails  courseProgress courses friendRequest friends lastName  image") // Select specific fields
      .populate("courseProgress")
      .populate({
        path:'additionalDetails',
        select:'about linkedinUrl '}).exec()

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({
      success: false,
      message: "No user found with the provided username",
      });
    }

    // Return the user details
    return res.status(200).json({
      success: true,
      data: userDetails,
    });
  } catch (error) {
    //console.log(error.message)
  }
}



exports.addFriend = async (req , res) => {
  try {
   
    const {friendId} = req.body ;
    const userId = req.user.id;
    if(!friendId){
      return res.status(400).json({
        success: false,
        message: "Friend is required",
      })
    }

    const friend = await User.findOne({_id:friendId})

    if (!friend) {
      return res.status(404).json({
      success: false,
      message: "No user found ",
      });
    }

    // const user = await User.findById(userId) ;

    if(friend.friendRequest.includes(userId)){
      return res.status(404).json({
        success: false,
        message: "Request Already Sent ",
        }); 
    }

   await friend.friendRequest.push(
      userId 
    )

    await friend.save()

    // const user = await User.findByIdAndUpdate(userId , {
    //   frinedRequest:{
    //     $push:friend._id
    //   }
    // })
    // Return the user details
    return res.status(200).json({
      success: true,
      message:'Request sent'
    });
  } catch (error) {
    //console.log(error.message)
  }
}



exports.acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requesterId } = req.body;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if request exists
    if (!user.friendRequest.includes(requesterId)) {
      return res.status(400).json({ success: false, message: "No request found" });
    }

    // Remove from friendRequest
    user.friendRequest = user.friendRequest.filter(
      (id) => id.toString() !== requesterId
    );

    // Add to friends list for both users
    user.friends.push(requesterId);
    requester.friends.push(userId);

    await user.save();
    await requester.save();

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requesterId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if request exists
    if (!user.friendRequest.includes(requesterId)) {
      return res.status(400).json({ success: false, message: "No request found" });
    }

    // Remove from friendRequest
    user.friendRequest = user.friendRequest.filter(
      (id) => id.toString() !== requesterId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
