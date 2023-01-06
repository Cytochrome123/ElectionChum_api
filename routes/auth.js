const express = require('express');

const { authController } = require('../controllers');
const { upload } = require('../config/multer');
module.exports = () => {
    const router = express.Router();

    router.post('/register', upload.single("passport"), authController.register);
    router.post('/login', authController.login);
    router.post('/forgotpassword', authController.resetPassword);
    return router;
}