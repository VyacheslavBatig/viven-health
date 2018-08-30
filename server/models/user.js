const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let User = new Schema({
    companyId: String,
    createdAt: String,
    email: String,
    emailVerified: Boolean,
    firstName: String,
    lastName: String,
    fullName: String,
    hasSeenVideo: Boolean,
    lastLoginAt: String,
    photoUri: String,
    emailHash: String,
    passHash: String,
    roles: {
        admin: Boolean,
        companyAdmin: Boolean
    }
});

module.exports = mongoose.model('user', User);