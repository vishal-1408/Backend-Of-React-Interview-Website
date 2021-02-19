const Participants = require("../models/Participants");

const getParticipants = async(req,res)=>{
    const particpants = await Participants.find({}).select("_id name email");
    res.status(200).send(particpants)
}


module.exports = {
    getParticipants
}