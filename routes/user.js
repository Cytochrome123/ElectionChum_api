const express = require('express');
const passport = require('passport');

const { userController } = require('../controllers');
const { uploadMiddleware } = require('../config/gridfs');

module.exports = () => {
    const router = express.Router();

    router.get('/', passport.authenticate('jwt'), userController.getDashboard);
    router.post('/vote', passport.authenticate('jwt'), userController.vote);

    router.get('/profile', passport.authenticate('jwt'), userController.getProfile);
    router.route('/file/:filename')
    .get(userController.getFile)
    .patch(passport.authenticate('jwt'), uploadMiddleware, userController.updateFile);    
    
    return router;
}