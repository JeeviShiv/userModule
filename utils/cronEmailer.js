const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/user');
const activity = require('../models/activities');
const EmailTemplates = require('../models/emailTemplates')
const nodemailer = require('nodemailer');
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

async function cronMailer() {
    console.log("Cron Email function calling for every "+ process.env.PASSWORD_REQUEST + " minutes");
    const allUsers = await User.find();
    allUsers.map(async(userInfo) => {
        const { _id: userId, emailId, username} = userInfo;
        const lastSent = await passwordLimit(userId);
        if(lastSent){
            const emailTemplate = await EmailTemplates.findOne({ name: 'Reset Password'}).lean().exec();
            let password;
            password = Math.random().toString(36).slice(-8);
            let message = emailTemplate.Message;
            message = message.replace('#USER#', username);
            message = message.replace('#PASSWORD#', password);
            message = message.replace('#SENDER#', process.env.EMAILFROM);
            const data = { to: emailId, subject: emailTemplate.Subject, message:message };
            await sendEmail(data);
            let hashedPwd;
            hashedPwd = await bcrypt.hash(password, 10);
            const results  = await User.findOneAndUpdate(userId,{$set:{'password':hashedPwd}},{new:true}); 
            await activity.create({userId: userId, type: 'Passwords sent', decription: 'New password sent'});
        }
    })
}
module.exports = {
    cronMailer
}