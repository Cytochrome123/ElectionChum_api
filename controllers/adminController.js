const { adminHandler } = require("../handlers");

const admin = {
    getPendingUsers: async (req, res, next) => {
        try {
            const my_details = req.user;
            const response = await adminHandler.getPendingUsers(next, my_details);

            res.status(response.status).json(response.data);
        } catch (err) {
            next(err);
        }
    },

    review: async (req, res, next) => {
        try {
            const my_details = req.user;
            const {id} = req.params;
            const response = await adminHandler.review(next, my_details,id);

            res.status(response.status).json(response.data);
        } catch(err) {
            next(err)
        }
    },

    sendReview: async (req, res, next) => {
        try {
            const my_details = req.user;
            const {id} = req.params;
            const payload = req.body;

            const response = await adminHandler.sendReview(my_details,id, payload);

            res.status(response.status).json(response.data);
        } catch (err) {
            next(err)
        }
    }
}

module.exports = admin;