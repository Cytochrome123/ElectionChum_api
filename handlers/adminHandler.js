const mongoose = require('mongoose');

const { queries } = require('../db');
const { User } = require('../model');


const admin = {
    getPendingUsers: async () => {
        try {
            let condition = { status: 'pending' };
            let projections = { 
                password: 0,
                votersID: 0,
                userType: 0,
                passport: 0,
                passportPath: 0,
                proof: 0,
                proofPath: 0
            }
            let options = {
                lean: true,
                sort: {createdDate: -1}
            };

            let pendingUsers = await queries.find( User, condition, projections, options );

            let count = await queries.countDocuments( User, condition );
            // if(pendingUsers) {
                return {
                    status: 200,
                    data: { pendingUsers, count }
                // }
            }
        } catch (err) {
            throw err;
        }
    },

    review: async (id) => {
        try {
            let condition = { _id: mongoose.Types.ObjectId(id) };
            let projections = {
                password: 0,
                votersID: 0,
                userType: 0,
            };
            let option = { lean: true };

            let details = await queries.findOne( User, condition, projections, option );

            if(details) {
                return {
                    status: 200,
                    data: { details }
                }
            }
            return {
                status: 400,
                data: { msg: 'Unable to load data!' }
            }
        } catch (err) {
            throw err;
        }
    },

    sendReview: async (id, payload) => {
        try {
            let condition = { _id: mongoose.Types.ObjectId(id) };
            let options = { lean: true, new: true };
            let update;
            if(payload.status === 'approved') {
                update = {
                    status: payload.status,
                    votersID: 12345678
                }
            } else {
                update = {
                    status: payload.status
                }
            }

            let updatedUser = await queries.update( User, condition, update, options );
            console.log(updatedUser)

            // let mailOptions = {
            //     to: updatedUser.email,
            //     from: sender,
            //     subject: 'Examiner confirmation mail',
            //     text: `Your email id ${updatedUser.email} has been ${
            //         updatedUser.status === 'approved'
            //             ? `approved.Your voter's ID is ${updatedUser.votersID}`
            //             : `declined, as ${payload.comment}`
            //     }  Thanks`,
            // };

            if(updatedUser) {
                return {
                    status: 200,
                    data: { msg: 'Your review has been made sucessfully!!!'}
                }
            }
            return {
                status: 400,
                data: { msg: 'Your review couldn\'t complete'}
            }
        } catch (err) {
            // throw err;
            return {
                status: 400,
                data: { msg: err.message }
            }
        }
    }
}

module.exports = admin;