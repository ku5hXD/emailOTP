const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    emailId: { type: String, required: true },
    otp: { type: Number, required: true },
    createdAt: { type: Date, required: true }
}, { collection: 'otp' });

module.exports = mongoose.model('otpCollection', otpSchema);
