const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    name:String,
    subject:String,
    message:String,
})

module.exports = mongoose.model('emailTemplates', emailSchema);