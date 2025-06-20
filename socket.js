// 📁 socket.js
const socketIo = require('socket.io');
const User = require('./models/user');

let io;

// 🔌 Initialize Socket.IO
function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: ['http://localhost:5173', 'https://ace-of-spades.onrender.com'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // 📡 When a new client connects
  io.on('connection', (socket) => {
    // console.log('🔌 New client connected:', socket.id);

    // ✅ Join socket with userId
    socket.on('join', async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { socketId: socket.id, active: true },
          { new: true }
        );
        socket.userId = userId;
        // console.log(`✅ ${user.firstName} joined. Socket ID: ${socket.id}`);

        // 🔄 Notify friends this user is online
        const friendSocketIds = await getFriendsSocketIds(userId);
        friendSocketIds.forEach(sId => {
          io.to(sId).emit("onlineStatus", { userId, online: true });
        });

      } catch (err) {
        // console.error('❌ Error on join:', err.message);
      }
    });

    // 📝 Typing indicator
    socket.on("typing", async ({ to }) => {
      const receiverSocketId = await getSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { from: socket.userId });
      }
    });

    socket.on("stopTyping", async ({ to }) => {
      const receiverSocketId = await getSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { from: socket.userId });
      }
    });

    // ❌ Disconnect user
    socket.on('disconnect', async () => {
      // console.log('⚠️ Client disconnected:', socket.id);
      try {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            active: false,
            socketId: null,
          });

          // 🔄 Notify friends this user is offline
          const friendSocketIds = await getFriendsSocketIds(socket.userId);
          friendSocketIds.forEach(sId => {
            io.to(sId).emit("onlineStatus", { userId: socket.userId, online: false });
          });

          // console.log(`🛑 ${socket.userId} marked inactive`);
        }
      } catch (err) {
        // console.error('❌ Error on disconnect:', err.message);
      }
    });
  });
}

// 📤 Emit event to a specific socket
function sendMessageToSocketId(socketId, { event, data }) {
  if (!io) throw new Error('Socket not initialized!');
  io.to(socketId).emit(event, data);
}

// 📡 Get socketId of a user
async function getSocketId(userId) {
  const user = await User.findById(userId);
  return user?.socketId;
}

// 🧠 Get socketIds of all friends
async function getFriendsSocketIds(userId) {
  const user = await User.findById(userId).populate("friends.user");
  return user.friends
    .map(f => f.user?.socketId)
    .filter(sId => sId !== undefined && sId !== null);
}

// 🧾 Exports
module.exports = {
  initializeSocket,
  sendMessageToSocketId,
  getSocketId,
  getFriendsSocketIds,
};
