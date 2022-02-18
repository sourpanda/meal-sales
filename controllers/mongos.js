const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.Promise = require("bluebird");

const userSchema = new Schema({
    "first_name": String,
    "last_name": String,
    "email": String,
    "password": String,
    "role": { String, default: 'user' },
    "createdOn" : {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('user', userSchema);