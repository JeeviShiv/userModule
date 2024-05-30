const activity = require("../models/activities");

async function requestLimit(id){
    var date = new Date();
    var MS_PER_MINUTE = 60000;
    var accessLimit = process.env.PROFILEAPI_ACCESS_LIMIT;
    var accessLimitTime = process.env.PROFILEAPI_ACCESS_TIME_LIMIT;
    var myStartDate = new Date(date - accessLimitTime * MS_PER_MINUTE);
    const data = await activity.find({"userId": id, 
                                        "createdAt": { $gt: new Date(myStartDate), $lt:new Date() }});
    if(data.length>=accessLimit){
        return false;
    }
    return true;
}

module.exports = requestLimit;