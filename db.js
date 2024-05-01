const mongoose = require("mongoose");
require('dotenv').config();
//  define the mongodb url for connection
const mongoUrl = process.env.MONGODB_URL_LOCAL;
// const mongoUrl = process.env.MONGODB_URL;
// establish connection and set up
mongoose.connect(mongoUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
// define event listeners 

db.on('connected',()=>{
  console.log("connected to db server!!");
});

db.on("disconnected", () => {
	console.log("Mongodb Disconnected!!");
});

db.on("error", (err) => {
	console.log("Mongodb connection error!!",err);
});

module.exports = db