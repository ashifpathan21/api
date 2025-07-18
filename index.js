const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const Location = require("./routes/Location");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const GenerateQuiz = require('./routes/GenerateQuiz.js')
const testRoutes = require("./routes/testRoutes.js");
const Leaderboard = require("./routes/LeaderBoard.js");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

//database connect
database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: ["https://ace-of-spades.onrender.com", "http://localhost:5173"],
		credentials:true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/course/test", testRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/location", Location);
app.use("/api/v1/getRank", Leaderboard);
app.use("/api/v1/quiz", GenerateQuiz);

//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});


module.exports = app 
