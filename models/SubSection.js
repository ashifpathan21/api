const mongoose = require("mongoose");
const questionSchema = require('./Question')
const SubSectionSchema = new mongoose.Schema({
	title: { type: String },
	timeDuration: { type: String },
	description: { type: String },
	videoUrl: { type: String },
	questions:[{
		type: mongoose.Schema.Types.ObjectId,
		// required: true,
		ref: "Question"
	}]
});

module.exports = mongoose.model("SubSection", SubSectionSchema);