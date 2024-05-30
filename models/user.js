const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    emailId:String,
    profilePicture:{type:String, default:null}
})

module.exports = mongoose.model('User', userSchema);