const express = require("express");
const app = express();
require('dotenv').config();
const db = require("./db");
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

// import thr router file
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

// use the router file
app.use('/user', userRoutes);
// we do not gen token in this and also there is no signup and login and role should be admin
app.use('/candidate', candidateRoutes);


app.listen(3000,(req,res)=>{
  console.log("Listening at port 3000")
});