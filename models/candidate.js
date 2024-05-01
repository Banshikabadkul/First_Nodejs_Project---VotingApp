const mongoose = require("mongoose");

const candidateSchema =new mongoose.Schema({
		name: {
			type: String,
			required: true,
		},
		party: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
		},
		// array of data which contain data of  user who voted and timestamp in form of objecct(nested obj) and user id is mongodb providedid[ARRAY oF oBJECTS]
		votes: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				votedAt: {
					type: Date,
					default: Date.now(),
				},
			},
		],
		voteCount: {
			type: Number,
			default: 0,
		},
	});

const Candidate = mongoose.model("Candidate",candidateSchema);
module.exports = Candidate;
