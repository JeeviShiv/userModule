const activity = require("../models/activities");

async function passwordLimit(id){
    var date = new Date();
    var MS_PER_MINUTE = 60000;
    var passwordLimit = process.env.PASSWORD_REQUEST;
    var myStartDate = new Date(date - passwordLimit * MS_PER_MINUTE);
    const data = await activity.find({"userId": id, "type": 'Passwords sent',
                                        "createdAt": { $gt: new Date(myStartDate), $lt:new Date() }});
    if(data.length>0){
        return false;
    }
    return true;
}
module.exports = passwordLimit;