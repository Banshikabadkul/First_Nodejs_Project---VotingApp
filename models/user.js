const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { json } = require("body-parser");
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	age: {
		type: Number,
		required: true,
	},
	email: {
		type: String,
	},
	mobile: {
		type: String,
	},
	address: {
		type: String,
		required: true,
	},
	adharcardNumber: {
		type: Number,
		require: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ["voter", "admin"],
		default: "voter",
	},
	isVoted: {
		type: Boolean,
		default: false,
	},
});

// convert pwd into hashed password before saving it to mongodb
userSchema.pre("save", async function (next) {
	const person = this;
	// hash the password only if its new or modified
	if (!person.isModified("password"))
		return next();
	try {
		// hash password generation
		const salt = await bcrypt.genSalt(10);
		// hash passworrd
		const hashPassword = await bcrypt.hash(
			person.password,
			salt
		);

		//overwrite plain pwd to hashed pwd
		person.password = hashPassword;
		next();
	} catch (err) {
		return next(err);
	}
});

userSchema.methods.comparePassword =
	async function (candidatePassword) {
		try {
			const isMatch = await bcrypt.compare(
				candidatePassword,
				this.password
			);
			return isMatch;
		} catch (err) {
			throw err;
		}
	};

// how compare func work in bcrypt
// prince  ---> ndskjfhidfhodjfodifj (pwd+salt)
// login --> agarwal
// ndskjfhidfhodjfodifj ---> extract salt from it(bcrpt func)
// agarwal+salt -->hash --> opiipoidsdkjdjjdej {it compare hashed pwd of both}

// create person model

const User = mongoose.model("User", userSchema);
module.exports = User;
