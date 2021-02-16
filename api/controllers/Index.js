const Interview = require("../models/Interview");
const Participants = require("../models/Participants");
const serverClient =require('../config/postmark');



const getInterviews = async (req,res)=>{
   try{
      const Interviews = await Interview.find({}).populate('participants','email name').exec();
      res.status(200).send({
          Interviews
      })
   }catch(e){
       console.log(e)
       res.status(400).send({
           error:e.toString()
       })
   }
}

const postInterview = async (req,res)=>{
    try{
        if(req.body.participants.length<2)
        throw new Error("Number of participants for the interview must be greater than or equal to2")

        let  interview = {
            startTime:req.body.startTime,
            endTime:req.body.endTime
        }
        const startTimeNew = new Date(req.body.startTime);
        const endTimeNew = new Date(req.body.endTime);
        console.log(startTimeNew,endTimeNew)
        const busyPaticipants = [];
        let participants;
     
        participants= await Participants.find({_id:{$in:req.body.participants}});
        for(let i=0;i<=participants.length-1;i++){
                try{
                     participants[i].checkClash(req.body.startTime,req.body.endTime);
                    }catch(e){
                     busyPaticipants.push(participants[i])
                }
           }
        if(busyPaticipants.length!=0) throw new Error('participants are busy!')
        
        let interviewObj = await Interview.create(interview);
    
        //sending emails!
        participants.forEach(async p=>{
           serverClient.sendEmail({
            "From": "chinthamvishal.2019@vitstudent.ac.in",
            "To": p.email,
            "Subject": "INTERVIEW Timings",
            "HtmlBody": `<h1>Your Interview is scheduled from ${startTimeNew} to ${endTimeNew} </h1>`,
            "TextBody": "Your Interview is scheduled from ${startTimeNew} to ${endTimeNew} ",
            "MessageStream": "outbound"
              });
            p.scheduledInterviews.push(interviewObj);
            await p.save();
           })
        interviewObj["participants"]=req.body.participants;
        await interviewObj.save()
        res.status(200).send({
            interviewObj,
            participants
        })
    
       }catch(e){
           errorMessage = {
               error:e.toString()
           }
           if(e.toString()==="Participant is busy!"){
              errorMessage[busyPaticipants]=busyPaticipants
           }
           console.log(e)
           res.status(400).send(errorMessage)
       }
}

const updateInterview = async (req,res)=>{
    try{
        if(req.body.participants && req.body.participants.length<2) throw new Error("Minimum of 2 participants must be selected!")
        const id = req.params.id.trim();
        console.log()
        const interview = await Interview.findById(id).populate('participants').exec();
        const oldParticipants = interview.participants;
        const newParticipants = req.body.participants;
        const startTimeNew = new Date(req.body.startTime);
        const endTimeNew = new Date(req.body.endTime);
        let removedParticipants = [];
        let rescheduledParticipants = [];
        let index
        const busyPaticipants = [];
        let participants;

       if(req.body.participants){
        for(let i=0;i<=oldParticipants.length-1;i++){
            index=newParticipants.findIndex(p=>p===oldParticipants[i]._id.toString())
            if(index===-1){
                removedParticipants.push(oldParticipants[i]);
                interview.participants.splice(i,1);
            }else{
                rescheduledParticipants.push(oldParticipants[i]);
                newParticipants.splice(index,1);
            }
        }


        if(newParticipants.length>0){
            participants= await Participants.find({_id:{$in:newParticipants}});
            for(let i=0;i<=participants.length-1;i++){
                try{
                     participants[i].checkClash(req.body.startTime,req.body.endTime);
                    }catch(e){
                     busyPaticipants.push(participants[i])
                }
            }
           

        }

        if(removedParticipants.length!=0){
            for(let i=0;i<=removedParticipants.length-1;i++){
                serverClient.sendEmail({
                      "From": "chinthamvishal.2019@vitstudent.ac.in",
                      "To": removedParticipants[i].email,
                      "Subject": "INTERVIEW has been cancelled",
                      "HtmlBody": `<h1>Your Interview scheduled from ${new Date(interview.startTime)} to ${new Date(interview.endTime)} has been cancelled! we will get back to you</h1>`,
                      "TextBody": "Your Interview is scheduled from ${startTimeNew} to ${endTimeNew} has been cancelled! we will get back to you",
                      "MessageStream": "outbound"
                        });
                      index=removedParticipants[i].scheduledInterviews.findIndex(i=>i._id.toString()===interview._id.toString());
                      removedParticipants[i].splice(index,1);
                      
                }
                
            }
            newParticipants.forEach(async p=>{
                serverClient.sendEmail({
                         "From": "chinthamvishal.2019@vitstudent.ac.in",
                         "To": p.email,
                         "Subject": "INTERVIEW Timings",
                         "HtmlBody": `<h1>Your Interview is scheduled from ${startTimeNew} to ${endTimeNew} </h1>`,
                         "TextBody": "Your Interview is scheduled from ${startTimeNew} to ${endTimeNew} ",
                         "MessageStream": "outbound"
                           });
                         p.scheduledInterviews.push(interview);
                         await p.save();
                         interview.participants.push(p);
                        })
    
       }else{
        rescheduledParticipants = interview.participants;
       }
        
        if(rescheduledParticipants.length!=0){
            for(let i=0;i<=rescheduledParticipants.length-1;i++){
                try{
                    RescheduledParticipants[i].checkClash(req.body.startTime,req.body.endTime,interview._id);
                   }catch(e){
                    busyPaticipants.push(rescheduledParticipants[i])
               }
           }
           if(busyPaticipants.length!=0) throw new Error('participants are busy!')
           
           for(let i=0;i<=rescheduledParticipants.length-1;i++){
            serverClient.sendEmail({
                "From": "chinthamvishal.2019@vitstudent.ac.in",
                "To": rescheduledParticipants[i].email,
                "Subject": "INTERVIEW has been rescheduled",
                "HtmlBody": `<h1>Your Interview has been rescheduled and it is from ${startTimeNew} to ${endTimeNew}</h1>`,
                "TextBody": "Your Interview has been rescheduled and it is from ${startTimeNew} to ${endTimeNew}",
                "MessageStream": "outbound"
                  });
                }
            }
                //handling removed participants

       
        interview.startTime=req.body.startTime;
        interview.endTime=req.body.endTime;
        await interview.save()

        res.status(200).send({
            interview,
            participants:[...newParticipants,...rescheduledParticipants]
        })

    }catch(e){
        errorMessage = {
            error:e
        }
        if(e.toString()==="Participant is busy!"){
           errorMessage[busyPaticipants]=busyPaticipants
        }
        console.log(e)
        res.status(400).send(errorMessage)
    }

}



module.exports = {
   getInterviews,
   postInterview,
   updateInterview

}