const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  options: { type: String, required: true },
});

module.exports = mongoose.model("Option", optionSchema);
