// Import necessary modules
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const { uploadImageToCloudinary } = require("../utils/imageUpload")
const ytdlp = require("yt-dlp-exec");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { sectionId, title, description , videoUrl } = req.body
    // const video = req.files.video

    // Check if all necessary fields are provided
    if (!sectionId || !title || !description  ) {
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" })
    }
    // //console.log(video)

    // // Upload the video file to Cloudinary
    // const uploadDetails = await uploadImageToCloudinary(
    //   video,
    //   process.env.FOLDER_NAME
    // )

    
//get duration 
  async function getDuration(videoUrl) {
  try {
    const info = await ytdlp(videoUrl, { dumpSingleJson: true });
    console.log(info)
    return info.duration;
  } catch (error) {
    throw new Error("Failed to fetch video duration");
  }
}

    
       const details = await   getDuration(videoUrl);
    
       //console.log(details)

    // //console.log(uploadDetails)
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
    //console.error("Error creating new sub-section:", error)
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

      async function getDuration(videoUrl) {
        const info = await ytdlp(videoUrl, { dumpSingleJson: true });
       
        //console.log(`Duration: ${info.duration} seconds`);
        return info.duration
    }
    
       const details = await   getDuration(videoUrl);
    


      subSection.timeDuration = `${details}`
    // }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    //console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    //console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    //console.log({ subSectionId, sectionId })
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
    //console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}
