const User = require('../models/user')
const asyncHandler = require('express-async-handler');
const verifyJWT = require('../middleware/verifyJWT');
const activity = require('../models/activities');

// Upload Image
const photo = asyncHandler(async(req, res) => {
    const { authorized, decoded } = verifyJWT();
    if(authorized){
        const id = decoded.id;
        if(req.file){
            const userObject = {profilePicture: req.file.path}
            const result = await User.findByIdAndUpdate(id,userObject,{new: true});
            await activity.create({userId: decoded.id, type: 'Profile Picture', decription: 'Profile picture updated'})
            return  res.json({ message: `Profile picture updated`, image: req.file.path})
        }
        else{
            return res.json({ error: `File upload failed`})
        }
    }
    else{
        res.json({ message: 'not authorized'})
    }
});

module.exports = {
    photo
};