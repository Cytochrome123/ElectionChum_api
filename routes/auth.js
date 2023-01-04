const express = require('express');

const { authController } = require('../controllers');
const { upload } = require('../config/multer');
module.exports = () => {
    const router = express.Router();

    router.post('/register', upload.single("file"),  authController.register);
    router.post('/login', authController.login);
    
    return router;
}