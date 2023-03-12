const express = require('express');
const passport = require('passport');

const { authController } = require('../controllers');
const { upload, uploadMiddleware } = require('../config/gridfs');


module.exports = () => {
    const router = express.Router();

    router.post('/upload', upload.array('files'), authController.forgot);

    router.post('/register', uploadMiddleware , authController.register);
    router.post('/login', authController.login);
    router.post('/verify', passport.authenticate('jwt', { session: false }) , authController.verify)
    // router.post('/verify', authController.verify)
    router.post('/forgotpassword', authController.resetPassword);
    router.post('/sendOTP', authController.sendOTP);
    router.post('/verifyOTP', authController.verifyOTP);
    return router;
}