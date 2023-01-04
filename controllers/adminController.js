const { adminHandler } = require("../handlers");

const admin = {
    getPendingUsers: async (req, res) => {
        try {
            const response = await adminHandler.getPendingUsers();

            res.status(response.status).json(response.data);
        } catch (err) {
            throw err;
        }
    },

    review: async (req, res) => {
        try {
            const {id} = req.params;
            const response = await adminHandler.review(id);

            res.status(response.status).json(response.data);
        } catch(err) {
            throw err;
        }
    },

    sendReview: async (req, res) => {
        try {
            const {id} = req.params;
            const payload = req.body;

            const response = await adminHandler.sendReview(id, payload);

            res.status(response.status).json(response.data);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = admin;