const passport = require('passport');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { queries } = require('../db');
const { factory } = require('../config');
const { User } = require('../model');
const { cloudinary } = require('../config/cloudinary');
// const cloudinary = require("cloudinary").v2
const mongoose = require('mongoose')
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

const auth = {
    forgot: async (res, req) => {
        try {
            console.log({file: req.file})
            res.json({file: req.file})
        } catch (e) {
            console.log(e)
        }
    },

    
    // need to fix the issue of the file upload when the account is not created --- or can use delete method on gfs, let's see
    register: async (next, userDetails, files) => {
        try {
            // const { firstName, lastName, email, password, phoneNumber, stateOfOrigin } = userDetails;
            // files.map(file => {
                if(files['passport'][0].size > 5000000) {
                    this.deleteImage(files['passport'][0].id);
                    return {
                        status: 400,
                        data: { msg: 'File shld not exceed 5mb'}
                    }
                }
            // })
            // if(files.size > 5000000) {
            //     this.deleteImage()
            // }
            console.log(userDetails)

            let condition = { email: userDetails.email };
            let options = { lean: true };
console.log(files)
            let exists = await queries.findOne(User, condition, options);
            if(!exists) {
                userDetails.password = factory.generateHashPassword(userDetails.password);
                userDetails['passport'] = {passportID: files['passport'][0].id};
                userDetails['passport'] = {...userDetails.passport ,path: files['passport'][0].filename};
                // userDetails['passport']['path'] = files['passport'][0].filename;
                userDetails['Birth Certificate'] = { 'Birth CertificateID': files['Birth Certificate'][0].id};
                userDetails['Birth Certificate'] ={...userDetails['Birth Certificate'] , path:  files['Birth Certificate'][0].filename};

                // Save user to database
                await queries.create(User, userDetails);
console.log(userDetails)
                return {
                    status: 200,
                    data: { msg: 'Check back in a few days to confirm if you\'re eligible to vote or not. Thanks'}
                }
            }
            auth.deleteImage(files['passport'][0].id);
            auth.deleteImage(files['Birth Certificate'][0].id)
            return {
                status: 401,
                data: { msg: 'Account already exists'}
            }
        } catch (err) {
            // throw err;
            next(err)
        }
    },

    login: async (req, res, next, userDetails) => {
        try {
            // User.findOne({ votersID: userDetails.votersID })63b686e9a9f459c23055f106
            let condition = { votersID: userDetails.votersID };
            let projection = {};
            let options = { lean: true };
            const user = await queries.findOne( User, condition, projection, options )
            // queries.findOne( User, condition, projection, option )
            // .then(async user => {
                if (!user) return res.status(401).json({ msg: 'Invalid votersID'});
                const correlates = factory.compareHashedPassword(userDetails.password, user.password);
                if(!correlates) return res.status(401).json({ msg: 'Invalid password'});
 // *******     // if(user.status !== 'approved') return res.status(403).json({msg: 'You need to get your account approved before you can log in'})
                // generate the OTP
                const OTP = Math.floor(100000 + Math.random() * 900000);
                console.log(OTP);

                console.log(user)
                const update = { OTP };
                options = { lean: true, new: true };
                const updated = await queries.findOneAndUpdate( User, condition, update, options );
                if(updated) {
                    console.log(updated)
                    //creates session and assign a token to it
                    const token = jwt.sign({ id: updated._id}, 'rubbish', {
                        expiresIn: '1d'
                    });
    
                    res.status(200).json({ msg: 'check your mail or phone for an OTP sent', userDetails, token})
                }
                // user.OTP = OTP;
                // await user.save()
                // .then(() => {

                //     //creates session and assign a token to it
                //     const token = jwt.sign({ id: user._id}, 'rubbish', {
                //         expiresIn: '1d'
                //     });
    
                //     res.status(200).json({ msg: 'check your mail or phone for an OTP sent', token})
                // })

            // })
            // .catch(e => console.log(e))
        } catch (err) {
            next(err);
        }
    },

    verify: async (req, res, next, otp) => {
        // the req.body to the login route is also passed automatically by the client and note to be entered again by the user
        try {
            let condition = { _id: mongoose.Types.ObjectId(req.user._id) };
            let projection = {};
            let options = { lean: true };

            passport.authenticate('local', (err, user, info) => {
                if (err) throw err;

                if(!user) return res.status(400).json({ msg: info.msg });

                if(user.OTP !== otp) return res.status(401).json({ msg: 'Invalid OTP'});

                // req.login(user)
                // .then(async () => {
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

                //     const newToken = jwt.sign({ id: user._id}, 'rubbish', {
                //         expiresIn: '3d'
                //     });
    
                //     user.lastLogin = new Date();
                //     await user.save()
                //     .then(() => res.status(200).json({ token: newToken, userObj }))
                    
                //     // res.status(200).json({userObj, token})
                // })
                // .catch(err => {
                //     if (err) throw err;
                // })
                req.login(user, async (err) => {
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

                    const newToken = jwt.sign({ id: user._id}, 'rubbish', {
                        expiresIn: '3d'
                    });
    
                    // user.lastLogin = new Date();
                    // await user.save()

                    const update = { lastLogin: new Date() };
                    options = { lean: true, new: true };
                    await queries.findOneAndUpdate( User, condition, update, options );
                    res.status(200).json({ token: newToken, userObj })
                    
                    // res.status(200).json({userObj, token})
                });
            })(req, res, next)

            // User.findOne({ _id: req.user._id })
            // queries.findOne( User, condition, projection, option )
            // .then(async user => {
            //     console.log(user);
            //     if (!user) return res.status(401).json({ msg: 'Invalid user'});
            //     if(user.OTP !== otp) return res.status(401).json({ msg: 'Invalid OTP'});

            //     const newToken = jwt.sign({ id: user._id}, 'rubbish', {
            //         expiresIn: '3d'
            //     });

            //     user.lastLogin = new Date();
            //     await user.save()
            //     .then(() => res.status(200).json({ token: newToken }))
            // })
        } catch (err) {
            next(err);
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

    // login: async (req, res, next) => {
    //     try {
    //         passport.authenticate('local', (err, user, info) => {
    //             if(err) throw err;

    //             if (!user) return res.status(400).json({ msg: info.msg });

    //             const OTP = Math.floor(Math.random() * 1000000);
    //             console.log(OTP)
    //             // req.session.OTP = 123;
    //             // console.log(req.session);

    //             const token = jwt.sign({email: user.email}, 'hgkebg');
    //             // **************** cache.set(token, OTP, 'EX', 60); *******
    //             // Send the code via SMS using Twilio
    //             // const client = new twilio(accountSid, authToken);
    //             // client.messages.create({
    //             //     to: '+1234567890', // User's registered mobile number
    //             //     from: '+0987654321', // Twilio phone number
    //             //     body: `Your one-time code is ${oneTimeCode}`
    //             // })
    //             // .then(() => {
    //             //     // Save the one-time code and token in cache
    //             //     cache.set(token, oneTimeCode, 'EX', 60);
    //             //     res.json({status: 'success', token});
    //             // })
    //             // .catch(err => {
    //             //     console.error(err);
    //             //     res.status(500).json({status: 'error', message: 'Failed to send SMS'});
    //             // });
                
    //             // req.login(user, (err) => {
    //             //     if (err) throw err;
    //             //     const userObj = {
    //             //         firstName: user.firstName,
    //             //         lastName: user.lastName,
    //             //         email: user.email,
    //             //         phoneNumber: user.phoneNumber,
    //             //         ['State of Origin']: user['State of Origin'],
    //             //         LGA: user.LGA,
    //             //         residence: user.residence,
    //             //         votersID: user.votersID,
    //             //         userType: user.userType,
    //             //         passport: user.passport,
    //             //         passportPath: user.passportPath,
    //             //     };
                    
    //             //     res.status(200).json({userObj, token})
    //             // });

    //         })(req, res, next)
    //     } catch (err) {
    //         res.status(400).json({ msg: err.message });
    //         // throw err;
    //     }
    // },

    // verify: async (req, otp) => {
    //     try {
    //         // console.log(otp)
    //         // console.log(req.session)
    //         // console.log(req.session.OTP)
    //         // if (otp === req.session.OTP) {
    //         //     // Clear the one-time code from the session
    //         //     req.session.OTP = null;
    //         //     return {
    //         //         status: 200,
    //         //         msg: 'verified'
    //         //     }
        
    //         // }
    //         cache.get(token)
    //         return {
    //             status: 400,
    //             msg: 'Not verified'
    //         }

    //         req.login(user, (err) => {
    //             if (err) throw err;
    //             const userObj = {
    //                 firstName: user.firstName,
    //                 lastName: user.lastName,
    //                 email: user.email,
    //                 phoneNumber: user.phoneNumber,
    //                 ['State of Origin']: user['State of Origin'],
    //                 LGA: user.LGA,
    //                 residence: user.residence,
    //                 votersID: user.votersID,
    //                 userType: user.userType,
    //                 passport: user.passport,
    //                 passportPath: user.passportPath,
    //             };
                
    //             res.status(200).json({userObj, token})
    //         });
    //     } catch (err) {
    //         return {
    //             status: 400,
    //             msg: err.message
    //         }
    //     }
    // },

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

    verifyOTP: async (req, userData) => {
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
            const data = `${phone}.${otp}.${expires}`;
            const newCalculatedHash = crypto.createHmac('sha256', '12345').update(data).digest('hex');
            console.log(newCalculatedHash);
            console.log(hashValue)
            if(newCalculatedHash === hashValue) {
                // req.verified = true;
                return {
                    status: 202,
                    data: { msg: 'User confirmed'}
                }
            } else {
                // req.verified = true;
                // console.log(req.verified)
                return {
                    status: 400,
                    data: {verification: false, msg: 'Incorrect OTP'}
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
            data: { msg: 'image deletion error'}
          }
          console.log('file deleted');
        });
    }
};

module.exports = auth;