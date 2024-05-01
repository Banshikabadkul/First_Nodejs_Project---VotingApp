
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate');


const checkAdminRole = async (userID) => {
   try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
   }catch(err){
        return false;
   }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) =>{
    try{
      const userId = req.user.id;
        if(!(await checkAdminRole(userId)))
            return res.status(403).json({message: 'user does not have admin role'});

        const data = req.body // Assuming the request body contains the candidate data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
      const userId = req.user.userData.id;
        if(!checkAdminRole(userId))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
      const userId = req.user.userData.id;

        if(!checkAdminRole(userId))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
// lets start voting---
router.post('/vote/:candidateId',jwtAuthMiddleware, async(req,res)=>{
    // no admin can vote
    // user can only vote once
    const candidateId = req.params.candidateId;
    const userId = req.user.id;
    try{
        // find the candidate document with specified candidateId
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message:"Candidate not found!"});
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found!"});
        }
        // check if user voted or not
        if(user.isVoted){
            return res.status(400).json({message:"You have already voted!"});
        }
        // admin role cant vote
        if(user.role == 'admin'){
            return res.status(403).json({message:"Admin is not allowed to vote"});
        }
        // update the candidate doc to save data
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        // update the user doc to save data in user.js model
        user.isVoted = true;
        await user.save();
        res.status(200).json({message : "Voted successfully"});
    }
    catch(err){
        res.status(500).json({error:'Internal server error'});
    }
});

// vote counts
router.get('/vote/count', async(req,res)=>{
    try{
        //find all candidte and sort them in descending order
        const candidate = await Candidate.find().sort({voteCount : 'desc'});

        // map the candidate to only return their name and vote count
        const voteRecord = candidate.map((data)=>{
            return {
                party : data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    }
    catch(err){
        res.status(500).json({error:'Internal server error'});
    }
})
// get list of all candidates
router.get('/', async(req,res)=>{
    try{
        // list of candidates
        const candidate = await Candidate.find();
        // map the candidate to return only their name and party
        const candidateRecord = candidate.map((data)=>{
            return{
                name:data.name,
                party:data.party
            }
        });
        return res.status(200).json(candidateRecord);

    }
    catch(err){
        res.status(500).json({error:'Internal server error'});
    }
})

module.exports = router;

// 400 Bad Request
// The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).

// 401 Unauthorized
// Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.

// 402 Payment Required Experimental
// This response code is reserved for future use. The initial aim for creating this code was using it for digital payment systems, however this status code is used very rarely and no standard convention exists.

// 403 Forbidden
// The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server.

// 404 Not Found
// The server cannot find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web.
// 500 Internal Server Error
// The server has encountered a situation it does not know how to handle.