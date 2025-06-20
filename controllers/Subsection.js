// Import necessary modules
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const { uploadImageToCloudinary } = require("../utils/imageUpload")
const ytdlp = require("yt-dlp-exec");
const axios = require("axios");
require('dotenv').config() 


async function getYouTubeDuration(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    const apiKey = process.env.YOU_TUBE;

    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
    const res = await axios.get(url);

    const isoDuration = res.data.items[0].contentDetails.duration;
    const seconds = convertISOToSeconds(isoDuration);
   

    return seconds;
  } catch (err) {
    // console.error("Failed to fetch YouTube video duration:", err.message);
    return null;
  }
}

// Extract Video ID from YouTube URL
function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Convert ISO 8601 Duration to seconds
function convertISOToSeconds(isoDuration) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const match = isoDuration.match(regex);

  if (!match) return 0; // fallback

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}


// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  // console.log('call traced ') ;
  try {
    // Extract necessary information from the request body
    const { sectionId, title, description , videoUrl } = req.body
    // const video = req.files.video
      //// console.log( sectionId, title, description , videoUrl ) ;
    // Check if all necessary fields are provided
    if (!sectionId || !title || !description  ) {
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" })
    }
    // //// console.log(video)

    // // Upload the video file to Cloudinary
    // const uploadDetails = await uploadImageToCloudinary(
    //   video,
    //   process.env.FOLDER_NAME
    // )

    


    
       const details = await getYouTubeDuration(videoUrl);
    
      // // console.log(details)

    // //// console.log(uploadDetails)
    // Create a new sub-section with the necessary information
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${details}`,
      description: description,
      videoUrl
    })

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    // Return the updated section in the response
    return res.status(200).json({ success: true, data: updatedSection })
  } catch (error) {
    // Handle any errors that may occur during the process
    //// console.error("Error creating new sub-section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description ,videoUrl } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    // if (req.files && req.files.video !== undefined) {
    //   const video = req.files.video
    //   const uploadDetails = await uploadImageToCloudinary(
    //     video,
    //     process.env.FOLDER_NAME
    //   )
      subSection.videoUrl = videoUrl 

   
    
       const details = await getYouTubeDuration(videoUrl);
    


      subSection.timeDuration = `${details}`
    // }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    //// console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    //// console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    //// console.log({ subSectionId, sectionId })
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )

    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    //// console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}
