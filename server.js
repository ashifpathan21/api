require('dotenv').config();
const http = require('http');
const app = require('./index'); // This is your express app ✅

const PORT = process.env.PORT || 4000;

const server = http.createServer(app); // Create server from express app ✅

const { initializeSocket } = require('./socket');  // Import your socket logic ✅
initializeSocket(server); // Initialize socket on the same server ✅

server.listen(PORT, () => {
  // console.log(`server is running on port ${PORT}`);
});
