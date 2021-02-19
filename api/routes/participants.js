
const express = require("express");
const router = express.Router();
const controllers = require("../controllers/participants");


router.get("/participants",controllers.getParticipants);


module.exports = router;