const express = require("express");
const router = express.Router();
const User = require("./../models/user");

const {jwtAuthMiddleware, generateToken} = require('./../jwt');

router.post('/signup',async(req,res)=>{
	try{
		
		const data = req.body;
		 // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }
				
		// create a new user document using mongoose model
		const newUser = new User(data);
		
		//save the new user to the db
		const response = await newUser.save();
		console.log('data saved');
		const payload = {
		id : response.id
		}
		const token = generateToken(payload);
		console.log("Token is : ", token);
		if(newUser.role == 'admin'){
			adminRole = true;
		}
		res.status(200).json({response : response, token : token});
	}
	catch(err){
		console.log(err);
		res.status(500).json({error:"Internal server error!"})
	}
});
// login route
router.post('/login',async(req,res)=>{
	try{
		//extract the uname and pwdd from body
		const { adharcardNumber, password } = req.body;
		const user = await User.findOne({adharcardNumber:adharcardNumber});
		if(!user || !(await user.comparePassword(password))){
				return res.status(401).json({error:"Invalid username or password"});
		}
		// geneartate tokens
		const payload = {
			id : user.id
		};
		const token = generateToken(payload);
		// return token as response
		return res.json({token});
	}
	catch(err){
		console.log(err);
		return res.status(500).json({error:"Internal server error"});
	}
})
// profile route
router.get('/profile',jwtAuthMiddleware, async(req,res)=>{
	try{
		const userData = req.user; // payload
		const userId = userData.id;
		const user = await User.findById(userId);
		res.status(200).json({user});
	}
	catch(err){
		console.log(err);
		return res.status(500).json({error:"Internal server error"});
	}
})

// updating user password data using its id
router.put('/profile/password',jwtAuthMiddleware, async(req,res)=>{
	try{
		const userId = req.user.id; // extract the user id from token
		const { currentPassword, newPassword } =
			req.body; // extract the current and new password from req.body
		const user = await User.findById(userId);
		// if password matchnor not
    if(!(await user.comparePassword(currentPassword))){
				return res.status(401).json({error:"Invalid username or password"});
		}
    // update password and save to db
    user.password = newPassword;
    await user.save();
		console.log("Password changed successfully");
		res.status(200).json({message:"Password updated"});
	}
	catch(err){
		console.log(err);
		res.status(500).json({error:"Internal server error!"})
	}
});


module.exports = router;