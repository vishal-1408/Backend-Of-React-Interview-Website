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
        type:mongoose.Schema.Types.ObjectId,
        ref:"Participants"
    }]
},{
    timestamps:true
})

const Interview = mongoose.model('Interview',interviewSchema);

module.exports =Interview;