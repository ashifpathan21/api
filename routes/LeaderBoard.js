const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboard");
const { auth , isStudent } = require("../middlewares/auth");

router.get("/leaderboard", auth, isStudent ,  getLeaderboard);

module.exports= router
