const { authHandler } = require('../handlers');

const auth = {
    register: async (req, res) => {
        try {
            const userDetails = req.body;
            
            let response = await authHandler.register(req, userDetails);

            res.status(response.status).json(response.data);
            
        } catch (err) {
            throw err;
        }
    },

    login: async (req, res, next) => {
        try {
            const userDetails = req.body;

            const response = authHandler.login(req, res, next);
            return response;
        } catch (err) {
            throw err;
        }
    },

    resetPassword: async (req, res) => {
        try {
            const payload = req.body;

            const response = await authHandler.resetPassword(payload);

            res.status(response.status).json(response.data);
        } catch (err) {
            res.status(err.status).json(err.message);
        }
    }
};

module.exports = auth;