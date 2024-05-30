const jwt = require('jsonwebtoken');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const secret = process.env.ACCESS_TOKEN_SECRET;

const verifyJWT = (req, res, next) => {
    var token = localStorage.getItem('accessToken')
    if (!token) return { authorized: false };
    const validated = jwt.verify(token, secret, function(err, decoded) {
        if (err) return { authorized: false };
        else {
            return { authorized: true, decoded};
        }
    });
  return validated;
};
module.exports = verifyJWT;