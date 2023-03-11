const { userHandler } = require("../handlers");

const user = {
    getDashboard: async (req, res, next) => {
        try {
            const my_details = req.user;

            const response = await userHandler.getDashboard(my_details, next);
            res.status(response.status).json(response.data);
        } catch (err) {
            next(err);
        }
    },

    vote: async (req, res, next) => {
        try {
            const voteDetails = req.body;
            const my_details = req.user

            const response = await userHandler.vote(next, voteDetails, my_details);

            res.status(response.status).json(response.data);
        } catch (err) {
            next(err);
        }
    },

    getPassport: async (req, res, next) => {
        try {
            const {id} = req.params;

            const response = userHandler.getPassport(res, id);
            return response;
        } catch (error) {
            next(err)
        }
    }
}

module.exports = user;