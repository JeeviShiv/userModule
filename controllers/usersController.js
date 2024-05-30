const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const User = require('../models/user');
const verifyJWT = require('../middleware/verifyJWT');
const activity = require('../models/activities');
const requestLimit = require('../middleware/requestLimit')

const createNewUser = asyncHandler(async (req, res)=>{
    const { username, password, emailId } = req.body;
    if(!username || !password || !emailId){
        res.json({"error":"All fields are required"});
    }
    //Check for existing username
    const exists = await User.findOne({ username }).lean().exec();
    if(exists){
        res.json({"error":"Username already exists"});
    }
    const hashedPwd = await bcrypt.hash(password, 10);
    const userObject = { username, "password": hashedPwd, emailId}

    //create new user
    const user = await User.create(userObject)
    if(user){
        res.json({ message: `New user ${username} created`})
    } else {
        return res.json({ message: 'Invalid user data received'})
    }
}) 

const getUserInfo = asyncHandler(async(req,res)=>{
    const accessLimit = process.env.PROFILEAPI_ACCESS_LIMIT;
    const { authorized, decoded } = verifyJWT();
    if(authorized){
        const limitAvailable = await requestLimit(decoded.id);
        if(limitAvailable){
            const userInfo = await User.findById({ _id: decoded.id});
            if(userInfo){ 
                await activity.create({userId: decoded.id, type: 'Profile API', decription: 'Requested for Profile details'})
            }
            return res.json(userInfo)
        }
        else{
            return res.json({"error": `Limit reached please try after ${accessLimit} minitues`});
        }
    }
    return res.json({ "message": "Not authorized"});
})

const updateUser = asyncHandler(async (req, res)=>{
    const { authorized, decoded } = verifyJWT();
    if(authorized){
        const { id, username, emailId, name } = req.body;
        if(!id || !username || !name || !emailId){
            return res.json({ error: 'All fields are required'})
        }
        const usernameExists = await User.find({ username, _id: { $ne: id } });
        if(usernameExists.length){
            return res.json({ error: 'Username already exists!'})
        }
        const userObject = {username, emailId, name}
        const result = await User.findByIdAndUpdate(id,userObject,{new: true});
        await activity.create({userId: decoded.id, type: 'Profile Update API', decription: 'Profile Details Updated'})
        res.json({ message: `${result.username} updated`})
    }
    return res.json({ "message": "Not authorized"});
}) 

module.exports = {
    createNewUser,
    getUserInfo,
    updateUser,
}
