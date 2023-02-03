const mongoose = require('mongoose');

const userTypeEnum = [ 'admin', 'user' ];
const accountStatusEnum = [ 'pending', 'declined', 'approved', 'active', 'deleted', ]

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, lowercase: true, index: true },
	lastName: { type: String, required: true, lowercase: true, index: true },
	email: { type: String, required: true },
	password: { type: String, required: true, default: null },
	phoneNumber: { type: String, required: true },
	DOB: { type: Date },
	['State of Origin']: { type: String, required: true },
	LGA: String,
	residence: String,
	votersID: { type: String, default: null },
    // // // nin: { type: Number, required: true },
	userType: { type: String, required: true, enum: userTypeEnum, default: 'user' },
	status: { type: String, required: true, enum: accountStatusEnum, default: 'pending' },
	passport: { type: String, default: null },
	passportPath: String,
	['Birth Certificate']: { type: String, required: true },
	'certPath': String,
	OTP: String,
	createdDate: { type: Number, default: Date.now },
	lastLogin: { type: Number, default: null },
	// fileId: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: 'Upload'
	// }
})

// userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema);