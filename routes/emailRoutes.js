const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.route('/resetPassword').get(emailController.resetPassword);
module.exports = router;
