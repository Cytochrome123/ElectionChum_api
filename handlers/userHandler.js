const { default: mongoose } = require("mongoose");
const { queries } = require("../db");
const { Vote, User } = require("../model");
const { cloudinary } = require('../config/cloudinary');

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
            // const condition = { id: mongoose.Types.ObjectId(id) };
            // let projection = { id: 1, passport: 1, passportPath: 1 };
            // let option = { lean: true };

            // const passport = await queries.findOne( User, condition, projection, option );

            // if(passport) {
            //     const img = await cloudinary.api.resource(passport.passport);
            //     console.log(img)
            //     res.download(passport.passportPath);
            // }
            res.download('http://res.cloudinary.com/iceece/image/upload/v1672908699/passport/mnifb7zvxh3p6mfyqjus.png');
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