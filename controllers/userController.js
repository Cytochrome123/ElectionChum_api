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

    getProfile: async (req, res, next) => {
        try {
            const my_details = req.user;

            const response = await userHandler.getProfile(my_details);
            res.status(response.status).json(response.data);
        } catch (err) {
            next(err);
        }
    },

    getFile: async (req, res, next) => {
        try {
            const {id} = req.params;

            const response = userHandler.getFile(res, id);
            return response;
        } catch (error) {
            next(err)
        }
    },

    updateFile: async (req, res, next) => {
        try {
            const my_details = req.user;
            const { id } = req.params;
            const { files } = req;

            const response = await userHandler.updateFile(next, my_details, id, files);

            res.status(response.status).json(response.data);
        } catch (err) {
            next(err)
        }
    }
}

module.exports = user;