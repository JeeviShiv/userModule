const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/user');
const activity = require('../models/activities');
const EmailTemplates = require('../models/emailTemplates')
const nodemailer = require('nodemailer');
const verifyJWT = require('../middleware/verifyJWT');
const passwordLimit = require('../middleware/passwordLimit');

async function sendEmail(data){
    const { to, subject, message } = data;
    const transporter = await nodemailer.createTransport({
        service: 'gmail', // use SSL
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASSWORD,
        }
    });
    // Configure the mailoptions object
    const mailOptions = {
        from: process.env.RESET_FROM_EMAIL,
        to: to,
        subject: subject,
        text: message
    };
    // Send the email
    await transporter.sendMail(mailOptions, function(error, info){
        if(info.response){            
            return true;
        }
        else{
            return false;
        }
    });
}

const resetPassword = asyncHandler(async(req, res)=> {
    const allUsers = await User.find();
    allUsers.map(async(userInfo) => {
        const { userId, emailId, name} = userInfo;
        const lastSent = await passwordLimit(userId);
        if(lastSent){
            const emailTemplate = await EmailTemplates.findOne({ name: 'Reset Password'}).lean().exec();
            var password = Math.random().toString(36).slice(-8);
            let message = emailTemplate.Message;
            message = message.replace('#USER#', name);
            message = message.replace('#PASSWORD#', password);
            message = message.replace('#SENDER#', process.env.EMAILFROM);
            const data = { to: emailId, subject: emailTemplate.Subject, message:message };
            await sendEmail(data);
            const hashedPwd = await bcrypt.hash(password, 10);
            await User.findByIdAndUpdate(userId,{'password':hashedPwd},{new: true});
            await activity.create({userId: userId, type: 'Passwords sent', decription: 'New password sent'});
            console.log(data);
        }
    })
})
module.exports = {
    resetPassword
}