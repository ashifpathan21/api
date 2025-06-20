// 📁 controllers/messageController.js
const Message = require("../models/Message");
const User = require("../models/User");
const { sendMessageToSocketId } = require("../socket");

// ✅ Send Message Controller
exports.sendMessage = async (req, res) => {
  try {
    const fromId = req.user.id;
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({ success: false, message: "Receiver and text required" });
    }

    const user = await User.findById(fromId);
    const isFriend = user.friends.some(friend => friend.user.toString() === to);
    if (!isFriend) {
      return res.status(403).json({ success: false, message: "Not friends with this user" });
    }

    let thread = await Message.findOne({ participants: { $all: [fromId, to] } });
    const newMsg = { from: fromId, text, timestamp: new Date(), isSeen: false };

    if (thread) {
      thread.messages.push(newMsg);
    } else {
      thread = new Message({
        participants: [fromId, to],
        messages: [newMsg]
      });
    }

    await thread.save();

    // ✅ Emit message if receiver is online
    const receiver = await User.findById(to);
    if (receiver.active && receiver.socketId) {
      sendMessageToSocketId(receiver.socketId, {
        event: "newMessage",
        data: {
          from: fromId,
          to,
          text,
          chatId: thread._id,
          timestamp: newMsg.timestamp,
          isSeen: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message sent",
      data: {
        from: fromId,
        to,
        text,
        chatId: thread._id,
        timestamp: newMsg.timestamp,
        isSeen: false
      }
    });

  } catch (err) {
    // console.error("SendMessage Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.markMessagesAsSeen = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.user.id;

  try {
    const chat = await Message.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.from.toString() !== userId && !msg.isSeen) {
        msg.isSeen = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();

      // ✅ Find the receiver (friend in chat)
      const friendId = chat.participants.find(id => id.toString() !== userId);
      const receiver = await User.findById(friendId);

      if (receiver?.active && receiver?.socketId) {
        sendMessageToSocketId(receiver.socketId, {
          event: "messageSeen",
          data: { chatId, by: userId }
        });
      }
    }

    return res.status(200).json({ success: true, message: "Messages marked as seen" });
  } catch (err) {
    // console.error("❌ Error marking messages seen:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
