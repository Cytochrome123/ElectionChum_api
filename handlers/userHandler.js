// const { default: mongoose } = require("mongoose");
const { queries } = require("../db");
const { Vote, User } = require("../model");
const { cloudinary } = require('../config/cloudinary');
// const { gfs } = require('../db');

const mongoose = require('mongoose');
const Grid = require('gridfs-stream');


const connn = mongoose.createConnection(process.env.MONGO_URL);

// Init gfs
let gfs;

connn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(connn.db, {
        bucketName: 'uploads'
      })
    gfs = Grid(connn.db, mongoose.mongo);
    gfs.collection('uploads');
	console.log('Gfs connected');
	// console.log(gfs)
})


// Connect to the MongoDB instance
// const conn = mongoose.connection;

// conn.once('open', () => {
//   // Initialize the gridfs-stream
//   gfs = new mongoose.mongo.GridFSBucket(conn.db);

//   module.exports = gfs;
// });


const user = {
    getDashboard: async (my_details) => {
        try {
            let condition = { userId: mongoose.Types.ObjectId('63b4742f9ba33fe7256fff76') };
            let projection = { id: 1, votersID: 1 };
            let option = { lean: true };

            const voted = await queries.findOne( Vote, condition, projection, option );

            if(voted) {
                // GET ALL VOTES
                let pipeline = [
                    { $match: {} },
                    { $group: { _id: '$party', count: { $sum: 1}}},
                    { $sort: { createdDate: -1 }},
                    // { $project: {
                    //     party: 1,
                    //     userId: 1,
                    //     firstName: 1,
                    //     ['State of Origin']: 1,
                    //     LGA: 1,
                    //     residence: 1
                    // }}
                ];

                let populateOptions = {
                    path: 'userId',
                    select: 'firstName',
                }
                const votes = await queries.aggregateDataAndPopulate(Vote, pipeline, populateOptions);

                // const count = await queries.countDocuments( Vote, pipeline[0].$match );

                return {
                    status: 200,
                    data: { votes }
                }
            } else {
                return {
                    status: 404,
                    data: { msg: 'You need to vote before you can have access to the votes data. Thanks' }
                }
            }
        } catch (err) {
            throw err;
        }
    },

    vote: async (voteDetails, my_details) => {
        try {
            let condition = { userId: mongoose.Types.ObjectId('63b4742f9ba33fe7256fff76') };
            let projection = { id: 1, votersID: 1 };
            let option = { lean: true };

            const voted = await queries.findOne( Vote, condition, projection, option );

            if(voted) {
                return {
                    status: 400,
                    data: { msg: 'You can only vote once!' }
                }
            }
            let voteObj = {
                userId: '63b4742f9ba33fe7256fff76',
                party: voteDetails.party
            }
            await queries.create( Vote, voteObj );

            return {
                status: 200,
                data: { msg: 'You vote has been counted' }
            }
        } catch (err) {
            throw err;
        }
    },

    getPassport: async (res, id) => {
        try {
            const condition = { _id: mongoose.Types.ObjectId(id) };
            let projection = { _id: 1, email: 1, passport: 1, passportPath: 1 };
            let option = { lean: true };

            const passport = await queries.findOne( User, condition, projection, option );
            console.log(passport)
            if(passport) {
                gfs.files.findOne({ filename: passport.passportPath }, (err, file) => {
                    if(!file || file.length === 0) {
                        return res.status(404).json({
                            msg: 'No file exists'
                        });
                    }

                    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                        const readstream = gridfsBucket.openDownloadStream(file._id);
                        readstream.pipe(res)
                        // return res.status(200).json({
                        //     file
                        // });
                    } else {
                        return {
                            status: 404,
                            data: { msg: 'Not an image' }
                        };
                    }
                })
            } else {
                return {
                    status: 400,
                    data: { msg: 'User not found' }
                }
            }
        } catch (error) {
            res.status(400).json(error.message)
        }
    },

    // getPassport: async (res, id) => {
    //     try {
    //         const condition = { id: mongoose.Types.ObjectId(id) };
    //         let projection = { id: 1, email: 1, passport: 1, passportPath: 1 };
    //         let option = { lean: true };

    //         const passport = await queries.findOne( User, condition, projection, option );

    //         if(passport) {
    //             const img = await cloudinary.api.resource(passport.passport);
    //             console.log(img)
    //             res.redirect('http://res.cloudinary.com/iceece/image/upload/v1672908699/passport/mnifb7zvxh3p6mfyqjus.png');
    //         }
    //         // res.redirect('http://res.cloudinary.com/iceece/image/upload/v1672908699/passport/mnifb7zvxh3p6mfyqjus.png');
    //     } catch (error) {
    //         res.status(400).json(error.message)
    //     }
    // },
    
    getBirthCert: async (res, id) => {
        try {
            const condition = { _id: mongoose.Types.ObjectId(id) };
            let projection = { _id: 1, email: 1, passport: 1, passportPath: 1 };
            let option = { lean: true };

            const cert = await queries.findOne( User, condition, projection, option );
            console.log(cert)
            if(cert) {
                gfs.files.findOne({ filename: cert.certPath }, (err, file) => {
                    if(!file || file.length === 0) {
                        return res.status(404).json({
                            msg: 'No file exists'
                        });
                    }

                    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                        const readstream = gridfsBucket.openDownloadStream(file._id);
                        readstream.pipe(res)
                        // return res.status(200).json({
                        //     file
                        // });
                    } else {
                        return {
                            status: 404,
                            data: { msg: 'Not an image' }
                        };
                    }
                })
            } else {
                return {
                    status: 400,
                    data: { msg: 'User not found' }
                }
            }
        } catch (error) {
            res.status(400).json(error.message)
        }
    },
    
};

module.exports = user;