const express = require("express");
const router = express.Router();


const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

const {
  createTest,
  updateTest,
  deleteTest
} = require("../controllers/testController.js");

const {
    submitTest
} = require('../controllers/submission.js')

router.post("/create",auth , isInstructor ,  createTest);
router.put("/update",auth , isInstructor , updateTest);
router.delete("/delete",auth , isInstructor , deleteTest);
router.post('/submit' , auth , isStudent , submitTest)
module.exports = router;
