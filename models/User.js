 // Import the Mongoose library
const mongoose = require("mongoose");

// Define the user schema using the Mongoose Schema constructor
const userSchema = new mongoose.Schema(
	{
		// Define the name field with type String, required, and trimmed
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		userName:{
			type: String ,
			unique: true
		},
		// Define the email field with type String, required, and trimmed
		email: {
			type: String,
			required: true,
			trim: true,
			unique:true 
		},
	friends: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message"
    }
  }
]

,

		// Define the password field with type String and required
		password: {
			type: String,
			required: true,
			// select:false 
		},
		// Define the role field with type String and enum values of "Admin", "Student", or "Visitor"
		accountType: {
			type: String,
			enum: ["Admin", "Student", "Instructor"],
			default: 'Student'
		},
		friendRequest:[
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			}
		],
		socketId:{
			type:String ,
		},
		active: {
			type: Boolean,
			default: true,
		},
		additionalDetails: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Profile",
		},
		courses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		],
		token: {
			type: String,
			select:false 
		},
		resetPasswordExpires: {
			type: Date,
		},
		image: {
			type: String,
			required: true,
		},
		courseProgress: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "courseProgress",
			},
		],

		// Add timestamps for when the document is created and last modified
	},
	{ timestamps: true }
);

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.models.user || mongoose.model("user", userSchema);

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZsb2dzdGhlYXNoQGdtYWlsLmNvbSIsImlkIjoiNjg1M2VmMzAzNjczYmE3ZDY0N2I3ZjNlIiwiaWF0IjoxNzUwMzMxODI4LCJleHAiOjE3NTA0MTgyMjh9.Bqq_2SlRFyKH3F6pd47tfOWFuWrM35smnuCjQdwVlBo


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFzaGlmd29ybGQyMUBnbWFpbC5jb20iLCJpZCI6IjY4NTNmMGUyMzY3M2JhN2Q2NDdiN2ZiMiIsImlhdCI6MTc1MDMzMTg2MywiZXhwIjoxNzUwNDE4MjYzfQ.tQJSZgt5Fgan_uswi40wqyMiquVOtbyuvm-hzdeLkTM