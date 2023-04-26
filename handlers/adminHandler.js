const mongoose = require('mongoose');

const { queries } = require('../db');
const { User } = require('../model');

// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const admin = {
    getPendingUsers: async (next, my_details) => {
        try {
            console.log(my_details)
            if (my_details.userType === 'admin') {

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
                    sort: { createdDate: -1 }
                };

                let pendingUsers = await queries.find(User, condition, projections, options);

                let count = await queries.countDocuments(User, condition);
                // if(pendingUsers) {
                return {
                    status: 200,
                    data: { pendingUsers, count }
                    // }
                }
            }
            return {
                status: 403,
                data: { msg: 'Sign in as an admin to access' }
            }
        } catch (err) {
            next(err)
        }
    },

    review: async (next, my_details, id) => {
        try {
            if (my_details.userType === 'admin') { 

                let condition = { _id: mongoose.Types.ObjectId(id) };
                let projections = {
                    password: 0,
                    votersID: 0,
                    userType: 0,
                };
                let option = { lean: true };

                let details = await queries.findOne(User, condition, projections, option);

                if (details) {
                    return {
                        status: 200,
                        data: { details }
                    }
                }
                return {
                    status: 400,
                    data: { msg: 'Unable to load data!' }
                }
            }
            return {
                status: 403,
                data: { msg: 'Signin as an admin to get access to the data' }
            }
        } catch (err) {
            next(err)
        }
    },

    sendReview: async (my_details, id, payload) => {
        try {
            // if (my_details.userType === 'admin') {

                let condition = { _id: mongoose.Types.ObjectId(id) };
                let options = { lean: true, new: true };

                let user = await queries.findOne(User, condition);
                console.log(condition);
                console.log(user)
                if(user) {
                    console.log('innnnnn')
                    user.status = payload.status;
                    payload.status === 'approved' ? user.votersID = 123456789 : ''

                    return await user.save()
                    .then(async updated => {
                        console.log(updated)
                        let mailOptions = {
                            to: updated.email,
                            from: process.env.sender,
                            subject: 'Examiner confirmation mail',
                            text: `Your email id ${updated.email} has been ${
                                updated.status === 'approved'
                                    ? `approved.Your voter's ID is ${updated.votersID}`
                                    : `declined, as ${payload.comment}`
                            }  Thanks`,
                        };

                        return await sgMail.send(mailOptions)
                        .then((response) => {
                            console.log('innnnnneeerrr')
                            return {
                                status: 200,
                                data: { msg: 'Your review has been made sucessfully!!!' }
                            }
                        })
                        .catch((error) => {
                            console.error(error)
                            return {
                                status: 400,
                                data: { msg: error }
                            }
                        })
                        
                    })
                    .catch( err => {
                        return {
                            status: 400,
                            data: { msg: 'Your review couldn\'t complete', err }
                        }
                    })


                }
                // return {
                //     status: 400,
                //     data: { msg: 'Selected user not found' }
                // }

            // return {
            //     status: 403,
            //     data: { msg: 'Sign in as an admin fam' }
            // }
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