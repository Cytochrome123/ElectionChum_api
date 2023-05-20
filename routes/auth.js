const express = require('express');
const passport = require('passport');

const { authController } = require('../controllers');
const { upload, uploadMiddleware } = require('../config/gridfs');
const { validation } = require('../helper');



module.exports = () => {
    const router = express.Router();

    router.post('/upload', upload.single('file'), authController.forgot);

    router.post('/register', uploadMiddleware, validation , authController.register);
    router.post('/login', authController.login);
    router.post('/verify', passport.authenticate('jwt', { session: false }) , authController.verify)
    // router.post('/verify', authController.verify)
    router.post('/forgot-password', authController.forgotPassword);
    router.route('/reset-password')
    // .get(authController.reset)
    .get(authController.resetPassword);
    router.post('/sendOTP', authController.sendOTP);
    router.post('/verifyOTP', authController.verifyOTP);
    return router;
}