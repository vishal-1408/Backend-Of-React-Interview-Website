const { referrerPolicy } = require("helmet");
const mongoose = require("mongoose");

const participantsSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type: String,
        lowercase: true,
        unique: true,
        trim: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    scheduledInterviews:[
        {
           type:mongoose.Schema.Types.ObjectId,
           ref:'Interview'
        }
    ]
},
{
    timestamps:true
})


//single function to check the clashing of interview timings
participantsSchema.methods.checkClash = function (start,end,id=null){
   const interviews=this.scheduledInterviews;
   for(let i=0;i<=interviews.length-1;i++){
       if(!(start.getTime()>interviews[i].endTime.getTime()) && !(end.getTime()<interviews[i].startTime.getTime())){
           if(!id || (id!=null && interviews[i]._id.toString()!=id.toString())) {
            throw new Error("Participant is busy!")
           }
       }
   }
}




const Participants = mongoose.model('Participants',participantsSchema);



module.exports =Participants;

