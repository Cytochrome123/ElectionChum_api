const { validationResult } = require('express-validator');
const { authHandler } = require('../handlers');

const auth = {
    forgot: async (res, req) => {
        try {
            let response = await authHandler.forgot(req, res);

            // res.status(response.status).json(response.data);
            return response;
        } catch (e) {
            console.log(e)
        }
    },
    
    // need a body validation    --------------------------
    register: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return res.status(400).json({ msg: errors.array()});
            }
            
            const userDetails = req.body;
            const files = req.files;

            let response = await authHandler.register(next, userDetails, files);

            if(response) {
                res.status(response.status).json(response.data);
            } else {
                res.status(500).json({msg: ''});
            }
            
        } catch (err) {
            // throw err;
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const userDetails = req.body;

            const response = authHandler.login(req, res, next, userDetails);
            return response;
        } catch (err) {
            throw err;
        }
    },

    verify: async (req, res) => {
        try {
            const {otp} = req.body;
            const { votersID } = req.query;

            const response = await authHandler.verify(req, res, votersID, otp);
            return response;
            
        } catch (err) {
            throw err;
        }
    },

    resetPassword: async (req, res) => {
        try {
            console.log(req.session)
            const payload = req.body;

            const response = await authHandler.resetPassword(payload);

            res.status(response.status).json(response.data);
        } catch (err) {
            res.status(err.status).json(err.message);
        }
    },

    sendOTP: async (req, res) => {
        try {
            const userDetails = req.body;
            
            let response = await authHandler.sendOTP(userDetails);

            res.status(response.status).json(response.data);
            
        } catch (err) {
            throw err;
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const userDetails = req.body;
            
            let response = await authHandler.verifyOTP(userDetails);

            res.status(response.status).json(response.data);
            
        } catch (err) {
            throw err;
        }
    },
};

module.exports = auth;