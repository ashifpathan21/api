const mongoose = require("mongoose");

// Define the Profile schema
const profileSchema = new mongoose.Schema({
	gender: {
		type: String,
		enum:['MALE' , 'FEMALE' , 'OTHER'],
		default:'MALE'
	},
	dateOfBirth: {
		type: String,
		default:''
	},
	about: {
		type: String,
		trim: true,
		default:''
	},
	contactNumber: {
		type: Number,
		trim: true,
		default:''
	},
	collegeName:{
		type:String,
		trim:true
	},
	linkedinUrl:{
		type:String,
		default:'' 
	}
});

// Export the Profile model
module.exports = mongoose.model("Profile", profileSchema);