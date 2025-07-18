const express = require("express")
const router = express.Router()
const { getLocation } = require("../controllers/Location")

router.post("/:state", getLocation)

module.exports = router