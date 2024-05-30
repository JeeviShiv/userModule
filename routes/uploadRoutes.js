const path = require('path');
const express = require('express');
const multer  = require('multer');
const uploadController = require('../controllers/uploadController')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/uploads')
    },
    filename: function (req, file, cb) {
        // You could rename the file name
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))

        // You could use the original name
        //cb(null, file.originalname)
    }
});

var upload = multer({storage: storage})
const router = express.Router();
router.route('/').post(upload.single('photo'), uploadController.photo)

module.exports = router;