const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/user');

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const findUser = await User.findOne({ username }).exec();
    if(!findUser){
        res.json({"error": "Invalid Username"})
    }
    const match = await bcrypt.compare(password, findUser.password);
    if(!match){
        res.json({"error": "Invalid Username or password"})
    }
    //Generate Token
    const accessToken = jwt.sign({"id":findUser._id}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '24h' });
    localStorage.setItem('accessToken', accessToken)
    res.json({ "success":"Login Successfully", accessToken})
})

const logout = asyncHandler(async (req, res) => {
    localStorage.removeItem('accessToken');
    res.json({"success":"Logout successfully"});
}); 

module.exports = {
    login,
    logout
}
