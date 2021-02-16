const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const expressLimiter = require("express-rate-limiter");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();
dotenv.config();

mongoose.connect(process.env.DBURL, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>console.log("database connected!"))
.catch(e=>console.log(e))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
if(!process.env.TESTING){

    //to prevent DOS ATTACKS
    app.use(new expressLimiter({
        windowMs: 1 * 60 * 1000,
        max: 40,
        message:
          "Too many requests received from this Ip address,please wait for a while",
    }))

    app.use(morgan("tiny"))
}
app.use(helmet());


//HANDLING CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });

const PORT = process.env.PORT || 4001
app.listen(PORT,()=>{
    console.log("SERVER IS RUNNING ON PORT: "+PORT);
})