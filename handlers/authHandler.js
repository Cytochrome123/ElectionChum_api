const passport = require('passport');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { queries } = require('../db');
const { factory } = require('../config');
const { User } = require('../model');
const { cloudinary } = require('../config/cloudinary');
// const cloudinary = require("cloudinary").v2
const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail')
// const otpMap = require('../auth/passport');
// const {gfs} = require('../db')
// let gfs;

let gfs;

const conn = mongoose.createConnection(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
});

conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
    });
    console.log('GFS up!!!')
})

const otpMap = new Map()

const auth = {
    forgot: async (res, req) => {
        try {
            console.log({ file: req.file })
            res.json({ file: req.file })
        } catch (e) {
            console.log(e)
        }
    },


    // need to fix the issue of the file upload when the account is not created --- or can use delete method on gfs, let's see
    register: async (next, userDetails, files) => {
        try {
            if (files['passport'][0].size > 5000000) {
                this.deleteImage(files['passport'][0].id);
                return {
                    status: 400,
                    data: { msg: 'File shld not exceed 5mb' }
                }
            }

            let condition = { email: userDetails.email };
            let options = { lean: true };

            let exists = await queries.findOne(User, condition, options);
            if (!exists) {
                userDetails.password = factory.generateHashPassword(userDetails.password);
                userDetails['passport'] = { passportID: files['passport'][0].id };
                userDetails['passport'] = { ...userDetails.passport, path: files['passport'][0].filename };
                // userDetails['passport']['path'] = files['passport'][0].filename;
                userDetails['Birth Certificate'] = { 'Birth CertificateID': files['Birth Certificate'][0].id };
                userDetails['Birth Certificate'] = { ...userDetails['Birth Certificate'], path: files['Birth Certificate'][0].filename };

                // Save user to database
                await queries.create(User, userDetails);

                return {
                    status: 200,
                    data: { msg: 'Check back in a few days to confirm if you\'re eligible to vote or not. Thanks' }
                }
            }
            auth.deleteImage(files['passport'][0].id);
            auth.deleteImage(files['Birth Certificate'][0].id)
            return {
                status: 401,
                data: { msg: 'Account already exists' }
            }
        } catch (err) {
            // throw err;
            next(err)
        }
    },



    login: async (req, res, next, userDetails) => {
        try {

            let condition = { votersID: userDetails.votersID };
            let projection = {};
            let options = { lean: true };

            // res.redirect(`/verify?email=${email}`)

            passport.authenticate('local', (err, user, info) => {
                if (err) throw err;
                if (!user) return res.status(400).json({ msg: info.msg });

                const OTP = Math.floor(100000 + Math.random() * 900000);
                otpMap.set(user.votersID, OTP);
                console.log(OTP);
                console.log(otpMap)
                const msg = {
                    to: user.email,
                    from: 'hoismail2017@gmail.com',
                    subject: 'Your OTP for login',
                    text: `Your OTP is: ${OTP}`,
                };
                sgMail.send(msg)
                    .then(() => {
                        console.log(`OTP sent to ${user.email}`);
                        return next(null, user);
                    })
                    .catch(err => {
                        console.error(`Error sending OTP to ${user.email}`, err);
                        return next(err);
                    });


                // req.login(user, async (err) => {
                //     if (err) throw err;
                //     const userObj = {
                //         firstName: user.firstName,
                //         lastName: user.lastName,
                //         email: user.email,
                //         phoneNumber: user.phoneNumber,
                //         ['State of Origin']: user['State of Origin'],
                //         LGA: user.LGA,
                //         residence: user.residence,
                //         votersID: user.votersID,
                //         userType: user.userType,
                //         passport: user.passport,
                //         passportPath: user.passportPath,
                //     };

                const token = jwt.sign({ id: user._id }, 'rubbish', {
                    expiresIn: '1d'
                });

                // user.lastLogin = new Date();
                // await user.save()

                // const update = { lastLogin: new Date(), OTP };
                // options = { lean: true, new: true };
                // await queries.findOneAndUpdate( User, condition, update, options );
                // res.status(200).json({ token: newToken, userObj })
                console.log(req.user)
                res.status(200).json({ msg: 'check your mail or phone for an OTP sent', token, votersID: user.votersID })
                // res.status(200).json({userObj, token})
                // });
            })(req, res, next)
        } catch (err) {
            throw err
        }
    },

    verify: async (req, res, votersID, otp) => {
        try {
            //             req.logout(err => err ? console.log('erty') : 'No')
            console.log(votersID)
            if (!votersID) return res.status(401).json({ msg: 'votersID not valid' });

            console.log(otpMap);
            const storedOTP = otpMap.get(votersID);

            // Check if the OTP is valid
            if (!storedOTP) {
                req.logout(err => {
                    return res.status(400).json({ message: 'OTP not found for this user' });
                });
                return;
            }

            if (+otp !== storedOTP) {
                req.logout((err) => {
                    if (err) return res.status(400).json({ message: err });
                    return res.status(400).json({ message: 'Invalid OTP' });
                });
                return;
            }

            otpMap.delete(votersID);

            await queries.findOne(User, { votersID })
                .then(user => {

                    req.login(user, err => {
                        if (err) {
                            return res.status(500).json({ message: err.message });
                        }
                        const newToken = jwt.sign({ id: user._id }, 'rubbish', {
                            expiresIn: '3d'
                        });

                        return res.json({ message: 'Login successful', newToken });
                    });
                })
                .catch(e => res.status(400).json({ message: e }))
        } catch (err) {
            throw err
        }
    },

    forgotPassword: async (email) => {
        try {

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return {
                    status: 400,
                    data: { msg: 'No user found with that email' }
                }
            }

            // Generate reset token and expiration date
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiration = Date.now() + 3600000; // 1 hour

            // Update user's reset token and expiration date
            user.resetToken = resetToken;
            user.resetTokenExpiration = resetTokenExpiration;
            await user.save();

            // Send password reset email using SendGrid
            const resetLink = `https://shy-plum-swordfish-sari.cyclic.app/api/reset-password?token=${resetToken}`;
            const msg = {
                to: user.email,
                from: process.env.sender,
                subject: 'Password reset request',
                text: `Hello ${user.name},\n\nYou have requested a password reset for your account. To reset your password, please click the following link:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this password reset, please ignore this email.\n\nThanks,\nThe Example Team`,
            };
            await sgMail.send(msg);

            return {
                status: 200,
                data: { msg: 'Password reset email sent' }
            }

        } catch (err) {
            return {
                status: 400,
                data: { err}
            }
        }
    },

    reset : async (token) => {
        try {
            // Find user by reset token
            const user = await User.findOne({
                resetToken: token,
                resetTokenExpiration: { $gt: Date.now() },
            });

            // If no user is found with the reset token, or the token has expired, return an error response
            if (!user) {
                return {
                    status: 400,
                    data: { msg: 'Invalid or expired reset token' }
                }
            }

            // Update user's password
            // user.password = password;
            // user.resetToken = undefined;
            // user.resetTokenExpiration = undefined;
            // await user.save();

            return {
                status: 202,
                data: { msg: 'Authorized' }
            }
        } catch (err) {
            return {
                status: 400,
                data: { err}
            }
        }
    },

    resetPassword: async (token, password) => {
        try {
            const user = await User.findOne({
                resetToken: token,
                resetTokenExpiration: { $gt: Date.now() },
            });

            if (!user) {
                return {
                    status: 400,
                    data: { msg: 'Invalid or expired reset token' }
                }
            }

            // Update user's password
            user.password = password;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            await user.save();

            return {
                status: 200,
                data: { msg: 'Password reset sucessful' }
            }
        } catch (err) {
            return {
                status: 400,
                data: { err}
            }
        }
    },
    
    // resetPassword: async (payload) => {
    //     try {
    //         let condition = { email: payload.email };
    //         let projection = {};
    //         let options = { lean: true };

    //         let user = await queries.findOne(User, condition, projection, options);

    //         if (user) {
    //             payload.password = factory.generateHashPassword(userDetails.password);

    //             let update = { password: payload.password };
    //             options = { lean: true, new: true };

    //             let newPassword = await queries.findOneAndUpdate(User, condition, update, options);
    //             if (newPassword) {
    //                 return {
    //                     status: 200,
    //                     data: { msg: 'Your password has been updated successfully' }
    //                 }
    //             }
    //             return {
    //                 status: 400,
    //                 data: { msg: 'Eeror pls try back later' }
    //             }
    //         }
    //         return {
    //             status: 400,
    //             data: { msg: 'This email doesn\'nt exists' }
    //         }
    //     } catch (error) {
    //         return {
    //             status: 400,
    //             data: { msg: error.message }
    //         }
    //     }
    // },

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
                data: { phone: userData.phoneNumber, hash: fullHash, otp }
            }
        } catch (err) {
            throw err;
        }
    },

    verifyOTP: async (req, userData) => {
        try {
            const phone = userData.phoneNumber;
            const hash = userData.hash;
            const otp = userData.otp;
            let [hashValue, expires] = hash.split('.');

            let now = Date.now();
            if (now > parseInt(expires)) {
                return {
                    status: 504,
                    data: { msg: 'Timeout!!!, pls try again' }
                }
            }
            const data = `${phone}.${otp}.${expires}`;
            const newCalculatedHash = crypto.createHmac('sha256', '12345').update(data).digest('hex');
            console.log(newCalculatedHash);
            console.log(hashValue)
            if (newCalculatedHash === hashValue) {
                // req.verified = true;
                return {
                    status: 202,
                    data: { msg: 'User confirmed' }
                }
            } else {
                // req.verified = true;
                // console.log(req.verified)
                return {
                    status: 400,
                    data: { verification: false, msg: 'Incorrect OTP' }
                }
            }
        } catch (err) {
            throw err;
        }
    },

    deleteImage: (id) => {
        if (!id || id === 'undefined') return res.status(400).send('No image ID');
        const _id = new mongoose.Types.ObjectId(id);
        gfs.delete(_id, (err) => {
            if (err) return {
                status: 500,
                data: { msg: 'image deletion error' }
            }
            console.log('file deleted');
        });
    }
};

module.exports = auth;