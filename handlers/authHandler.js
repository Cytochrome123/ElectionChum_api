const passport = require('passport');
const crypto = require('crypto');

const { queries } = require('../db');
const { factory } = require('../config');
const { User } = require('../model');
const { cloudinary } = require('../config/cloudinary');


const auth = {
    register: async (req, userDetails) => {
    try {
        let condition = { email: userDetails.email };
        let options = { lean: true };

        let exists = await queries.findOne(User, condition, options);
        console.log(req.file)
        console.log(req.file.path)
        console.log(userDetails.passport)
        if(!exists) {
            userDetails.password = factory.generateHashPassword(userDetails.password);
            // userDetails['passport'] = req.file.originalname;
            // userDetails['passportPath'] = req.file.path;
            
            // const passport = await cloudinary.uploader.upload(req.file.path, { folder: 'passport' });

            // userDetails['passport'] = passport.public_id;
            // userDetails['passportPath'] = passport.secure_url;

            await queries.create(User, userDetails);

            return {
                status: 200,
                data: { msg: 'Check back in afew days to confirm if you\'re eligible to vote or not. Thanks'}
            }
        } else {

            // throw new Error('Account already exists');
            return {
                status: 400,
                data: { msg: 'Account already exists'}
            }
        }
    } catch (err) {
        throw err;
        // return {
        //     status: 400,
        //     data: { msg: err.message }
        // }
    }
},

    // register: async (req, userDetails) => {
    //     try {
    //         let condition = { email: userDetails.email };
    //         let options = { lean: true };

    //         let exists = await queries.findOne(User, condition, options);
    //         console.log(req.file)
    //         // console.log(req.file.path)
    //         console.log(userDetails.passport)
    //         if(!exists) {
    //             userDetails.password = factory.generateHashPassword(userDetails.password);
    //             // userDetails['passport'] = req.file.originalname;
    //             // userDetails['passportPath'] = req.file.path;
                
    //             await cloudinary.uploader.upload(req.file.path, { folder: 'passport' })
    //             .then(async (passport) => {

    //                 userDetails['passport'] = passport.public_id;
    //                 userDetails['passportPath'] = passport.secure_url;

    //                 console.log(userDetails)
    
    //                 await queries.create(User, userDetails).then(res => {
                        
    //                     return {
    //                         status: 200,
    //                         data: { msg: 'Check back in afew days to confirm if you\'re eligible to vote or not. Thanks'}
    //                     }
    //                 })
    
    //             })
    //             .catch(err => {
    //                 console.log(err)
    //             })

    //             // return {
    //             //     status: 200,
    //             //     data: { msg: 'Check back in afew days to confirm if you\'re eligible to vote or not. Thanks'}
    //             // }

    //         } else {

    //             // throw new Error('Account already exists');
    //             return {
    //                 status: 400,
    //                 data: { msg: 'Account already exists'}
    //             }
    //         }
    //     } catch (err) {
    //         throw err;
    //         // return {
    //         //     status: 400,
    //         //     data: { msg: err.message }
    //         // }
    //     }
    // },

    // register: async (req, userDetails) => {
    //     try {
    //         let condition = { email: userDetails.email };
    //         let options = { lean: true };

    //         let exists = await queries.findOne(User, condition, options);

    //         if(!exists) {
    //             userDetails.password = factory.generateHashPassword(userDetails.password);
    //             userDetails['passport'] = req.file.originalname;
    //             userDetails['passportPath'] = req.file.path;

    //             await queries.create(User, userDetails);

    //             return {
    //                 status: 200,
    //                 data: { msg: 'Check back in afew days to confirm if you\'re eligible to vote or not. Thanks'}
    //             }
    //         }
    //         // throw new Error('Account already exists');
    //         return {
    //             status: 400,
    //             data: { msg: 'Account already exists'}
    //         }
    //     } catch (err) {
    //         throw err;
    //         // return {
    //         //     status: 400,
    //         //     data: { msg: 'Account already exists'}
    //         // }
    //     }
    // },

    login: async (req, res, next) => {
        try {
            passport.authenticate('local', (err, user, info) => {
                if(err) throw err;

                if (!user) return res.status(400).json({ msg: info.msg });

                req.login(user, (err) => {
                    if (err) throw err;
                    const userObj = {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        ['State of Origin']: user['State of Origin'],
                        LGA: user.LGA,
                        residence: user.residence,
                        votersID: user.votersID,
                        userType: user.userType,
                        passport: user.passport,
                        passportPath: user.passportPath,
                    };
                    
                    res.status(200).json(userObj)
                });

            })(req, res, next)
        } catch (err) {
            res.status(400).json({ msg: err.message });
            // throw err;
        }
    },

    resetPassword: async (payload) => {
        try {
            let condition = { email: payload.email };
            let projection = {};
            let options = { lean: true };

            let user = await queries.findOne( User, condition, projection, options );

            if(user) {
                payload.password = factory.generateHashPassword(userDetails.password);

                let update = { password: payload.password };
                options = { lean: true, new: true };

                let newPassword = await queries.findOneAndUpdate( User, condition, update, options );
                if(newPassword) {
                    return {
                        status: 200,
                        data: { msg: 'Your password has been updated successfully' }
                    }
                }
                return {
                    status: 400,
                    data: { msg: 'Eeror pls try back later' }
                }
            }
            return {
                status: 400,
                data: { msg: 'This email doesn\'nt exists' }
            }
        } catch (error) {
            return {
                status: 400,
                data: { msg: error.message }
            }
        }
    },

    sendOTP: async (userData) => {
        try {
            const otp = Math.floor(100000 + Math.random() * 9000000);
            const ttl = 2 * 60 * 1000;
            const expires = Date.now() + ttl;
            const data = `${userData.phoneNumber}.${otp}.${expires}`;
            const hash = crypto.createHmac('sha256', '12345').update(data).digest('hex');
            const fullHash = `${hash}.${expires}`

            return {
                status: 200,
                data: {phone: userData.phoneNumber, hash: fullHash, otp}
            }
        } catch (err) {
            throw err;
        }
    },

    verifyOTP: async (userData) => {
        try {
            const phone = userData.phoneNumber;
            const hash = userData.hash;
            const otp = userData.otp;
            let [hashValue, expires] = hash.split('.');

            let now = Date.now();
            if(now > parseInt(expires)) {
                return {
                    status: 504,
                    data: { msg: 'Timeout!!!, pls try again'}
                }
            }
            const data = `${userData.phoneNumber}.${otp}.${expires}`;
            const newCalculatedHash = crypto.createHmac('sha256', '12345').update(data).digest('hex');

            if(newCalculatedHash === hashValue) {
                return {
                    status: 202,
                    data: { msg: 'User confirmed'}
                }
            } else {
                return {
                    status: 400,
                    data: {verification: false, msg: 'Incorrect OTP'}
                }
            }
        } catch (err) {
            throw err;
        }
    },
};

module.exports = auth;