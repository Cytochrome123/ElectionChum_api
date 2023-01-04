const mongoose = require('mongoose');


const voteSchema = new mongoose.Schema({
    userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
    party: { type: String, required: true },
	createdDate: { type: Number, default: Date.now },
})


module.exports = mongoose.model('Vote', voteSchema);