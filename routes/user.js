const express = require('express');
const passport = require('passport');

const { userController } = require('../controllers');

module.exports = () => {
    const router = express.Router();

    router.get('/', passport.authenticate('jwt'), userController.getDashboard);
    router.get('/passport/:id', userController.getPassport);
    router.post('/vote', passport.authenticate('jwt'), userController.vote);
    // router.get('/vote', userController.getAllVote)
    
    return router;
}