const mongoose = require('mongoose') ;

const optionSchema = new mongoose.Schema({
    options: {
      type: String
    },
  });
  
 

module.exports = mongoose.model("Option", optionSchema);