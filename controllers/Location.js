require("dotenv").config()
const axios = require('axios')

exports.getLocation = async (req, res) => {
  const { state } = req.params;

    
  const apiKey = process.env.MAP_API_KEY
    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?types=establishment&region=IN&key=${apiKey}&input=${state}`
  try {
    

    const response = await axios.get(url);
   
     const data =  response?.data?.predictions?.map(prediction => prediction.structured_formatting.main_text);


    return res.json({ success: true, data});
  } catch (err) {
  //  console.error("ERR", err.response?.status || err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch colleges", error: err.message });
  }
};