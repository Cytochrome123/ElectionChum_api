const express = require('express');

const { userController } = require('../controllers');

module.exports = () => {
    const router = express.Router();

    router.get('/', userController.getDashboard);
    router.get('/:id/passport', userController.getPassport);
    router.post('/vote', userController.vote);
    // router.get('/vote', userController.getAllVote)
    
    return router;
}