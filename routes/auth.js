const express = require('express');
const passport = require('passport');

const { authController } = require('../controllers');
const { upload } = require('../config/gridfs');


module.exports = () => {
    const router = express.Router();

    router.post('/upload', upload.single('file'), authController.forgot);

    router.post('/register', upload.single("file"), authController.register);
    router.post('/login', authController.login);
    router.post('/verify', passport.authenticate('jwt', { session: false }) , authController.verify)
    router.post('/forgotpassword', authController.resetPassword);
    router.post('/sendOTP', authController.sendOTP);
    router.post('/verifyOTP', authController.verifyOTP);
    return router;
}