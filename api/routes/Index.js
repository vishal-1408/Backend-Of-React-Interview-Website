const express = require("express");
const router = express.Router();
const controllers = require("../controllers/Index");


router.get("/interviews",controllers.getInterviews);


router.post("/interview",controllers.postInterview);


router.patch("/interview/:id",controllers.updateInterview);





module.exports = router;