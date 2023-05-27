const express = require('express');
const passport = require('passport');

const { userController } = require('../controllers');
const { uploadMiddleware } = require('../config/gridfs');

module.exports = () => {
    const router = express.Router();

    router.get('/', passport.authenticate('jwt'), userController.getDashboard);
    router.post('/vote', passport.authenticate('jwt'), userController.vote);
    // router.get('/vote', userController.getAllVote)
    // router.get('/passport/:id', userController.getPassport);
    // router.get('/birth-certificate/:id', userController.getCertificate);

    router.get('/profile', passport.authenticate('jwt'), userController.getProfile);
    router.route('/file/:id')
    .get(userController.getFile)
    .patch(passport.authenticate('jwt'), uploadMiddleware, userController.updateFile);    
    
    return router;
}