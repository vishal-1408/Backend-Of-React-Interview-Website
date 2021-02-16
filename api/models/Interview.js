const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
    startTime:{
        type:Number,
        required:'start time required'
    },
    endTime:{
        type:Number,
        required:'end time required'
    },
    participants:[{
        type:Schema.Types.ObjectId,
        ref:"Participants",
        required:true
    }]
},{
    timestamps:true
})

const Interview = mongoose.model('Interview',interviewSchema);

module.exports =Interview;