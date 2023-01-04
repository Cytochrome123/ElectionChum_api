const express = require('express');

const { adminController } = require('../controllers');

module.exports = () => {
    const router = express.Router();

    router.get('/review', adminController.getPendingUsers);
    router.get('/review/:id', adminController.review);
    router.patch('/review/:id', adminController.sendReview);
    
    return router;
}