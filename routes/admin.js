const express = require('express');
const passport = require('passport');

const { adminController } = require('../controllers');

module.exports = () => {
    const router = express.Router();

    router.get('/review', passport.authenticate('jwt') , adminController.getPendingUsers);
    router.get('/review/:id', passport.authenticate('jwt') ,adminController.review);
    router.patch('/review/:id', passport.authenticate('jwt') ,adminController.sendReview);
    router.get('/getUsers', passport.authenticate('jwt'), adminController.getUsersWithVotersID);
    
    return router;
}