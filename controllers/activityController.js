const asyncHandler = require('express-async-handler')
const Activities = require('../models/activities');
const verifyJWT = require('../middleware/verifyJWT');

const getAll = asyncHandler(async (req, res) => {
    const { authorized, decoded } = verifyJWT();
    if(authorized){
        try{
            const stats = await Activities.aggregate([
                { $match: { $expr : { $eq: [ '$userId' , { $toObjectId: decoded.id } ] } } },
                { $group: {_id:{createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt"} },type:"$type"}, count:{$sum:1}}},
                { $sort: {"_id.createdAt":-1}}
            ]).exec();
            res.json(stats);
        }
        catch(error) {
            res.json(error);
        }
    }
})
module.exports = {
    getAll
}