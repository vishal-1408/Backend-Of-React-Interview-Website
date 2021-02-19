const express = require("express");
const router = express.Router();
const controllers = require("../controllers/interview");


router.get("/interviews",controllers.getInterviews);

router.post("/interview",controllers.postInterview);

router.get("/interview/:id",controllers.getInterview)

router.patch("/interview/:id",controllers.updateInterview);





module.exports = router;