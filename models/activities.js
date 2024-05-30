const mongoose = require('mongoose');

const activitiesSchema = new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    type:String,
    decription:String
},{
    timestamps: true
})
module.exports = mongoose.model('activities', activitiesSchema);