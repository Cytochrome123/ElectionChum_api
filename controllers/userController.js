const { userHandler } = require("../handlers");

const user = {
    getDashboard: async (req, res) => {
        try {
            const my_details = req.user;

            const response = await userHandler.getDashboard(my_details);
            res.status(response.status).json(response.data);
        } catch (err) {
            throw err;
        }
    },

    vote: async (req, res) => {
        try {
            const voteDetails = req.body;
            const my_details = req.user

            const response = await userHandler.vote(voteDetails, my_details);

            res.status(response.status).json(response.data);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = user;