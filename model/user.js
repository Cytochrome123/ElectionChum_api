const mongoose = require('mongoose');

const userTypeEnum = [ 'admin', 'user' ];
const accountStatusEnum = [ 'pending', 'declined', 'approved', 'active', 'deleted', ]

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, lowercase: true, index: true },
	lastName: { type: String, required: true, lowercase: true, index: true },
	email: { type: String, required: true },
	password: { type: String, required: [true, 'Password required'] , default: null },
	phoneNumber: { type: String, required: true },
	['State of Origin']: { type: String, required: true },
	LGA: String,
	residence: String,
	votersID: { type: String, default: null },
    // nin: { type: Number, required: true },
	userType: { type: String, required: true, enum: userTypeEnum, default: 'user' },
	status: { type: String, required: true, enum: accountStatusEnum, default: 'pending' },
	passport: {
		passportID: { type: String, default: null },
		path: String,
	},
	'Birth Certificate': {
		['Birth CertificateID']: { type: String, required: true },
		path: String,
	},
	OTP: String,
	createdDate: { type: Number, default: Date.now },
	lastLogin: { type: Number, default: null },
})

// userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema);