const User = require("../models/User")
const Message = require("../models/Message")
require("dotenv").config()


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

    return res.status(200).json({
      success: true,
      message:'Request sent'
    });
  } catch (error) {
    //// console.log(error.message)
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

    if (!user.friendRequest.includes(requesterId)) {
      return res.status(400).json({ success: false, message: "No request found" });
    }

    // ✅ Remove request from list
    user.friendRequest = user.friendRequest.filter(id => id.toString() !== requesterId);

    // ✅ Check or create thread
    let thread = await Message.findOne({ participants: { $all: [userId, requesterId] } });

    if (!thread) {
      thread = new Message({
        participants: [userId, requesterId],
        messages: []
      });
      await thread.save(); // Only save if new
    }

    // ✅ Push friend to both sides (prevent duplicates)
    const alreadyFriendUser = user.friends.some(f => f.user.toString() === requesterId);
    const alreadyFriendRequester = requester.friends.some(f => f.user.toString() === userId);

    if (!alreadyFriendUser) {
      user.friends.push({ user: requesterId, chat: thread._id });
    }

    if (!alreadyFriendRequester) {
      requester.friends.push({ user: userId, chat: thread._id });
    }

    await user.save();
    await requester.save();

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
      chatId: thread._id
    });

  } catch (err) {
    // console.error("Error accepting friend request:", err);
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
