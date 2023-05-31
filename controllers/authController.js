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
            console.log(files)
            console.log({passportID: files['passport'][0].buffer}, 'userDetails')


            let response = await authHandler.register(next, userDetails, files);

            // if(response) {
                res.status(response.status).json(response.data);
            // } else {
            //     res.status(500).json({msg: ''});
            // }
            
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

    forgotPassword: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            console.log(email)
            const response = await authHandler.forgotPassword(email, password);
console.log(response);
            res.status(response.status).json(response.data);
        } catch (err) {
            next(err);
        }
    },


    reset: async (req, res) => {
        try {
            const { token } = req.query;
            console.log(req.query);
            const { password } = req.body;
            console.log(req.session)

            const response = await authHandler.reset(token, password);

            res.status(response.status).json(response.data);
        } catch (err) {
            res.status(err.status).json(err.message);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            const {token, password} = req.query;
            // const {password} = req.body;

            const response = await authHandler.resetPassword(token, password);

            res.status(response.status).json(response.data);
        } catch (err) {
            next(err)
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