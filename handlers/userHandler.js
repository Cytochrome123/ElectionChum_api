const { default: mongoose } = require("mongoose");
const { queries } = require("../db");
const { Vote, User } = require("../model");
const { cloudinary } = require('../config/cloudinary');
const gfs = require("../db/connection");


const user = {
    getDashboard: async (my_details, next) => {
        try {
            console.log(my_details)
            let condition = { userId: mongoose.Types.ObjectId(my_details._id) };
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
            next(err);
        }
    },

    vote: async (next, voteDetails, my_details) => {
        try {
            let condition = { userId: mongoose.Types.ObjectId(my_details._id) };
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
                userId: my_details._id,
                party: voteDetails.party
            }
            await queries.create( Vote, voteObj );

            return {
                status: 200,
                data: { msg: 'You vote has been counted' }
            }
        } catch (err) {
            next(err);
        }
    },

    getPassport: async (res, id) => {
        try {
            console.log(gfs)
            // res.redirect('http://res.cloudinary.com/iceece/image/upload/v1672908699/passport/mnifb7zvxh3p6mfyqjus.png');

            gfs.files.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, (err, file) => {
                if (!file || file.length === 0) {
                  return res.status(404).json({
                    message: 'File not found'
                  });
                }
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            
            })
        } catch (error) {
            res.status(400).json(error.message)
        }
    }
    
    // getPassport: async (res, id) => {
    //     try {
    //         const condition = { id: mongoose.Types.ObjectId(id) };
    //         let projection = { id: 1, passport: 1, passportPath: 1 };
    //         let option = { lean: true };

    //         const passport = await queries.findOne( User, condition, projection, option );

    //         if(passport) {
    //             const x = `${__dirname}/${passport.passportPath}`;
    //             res.download(x);
    //         }
    //     } catch (error) {
    //         res.status(400).json(error.message)
    //     }
    // }
};

module.exports = user;