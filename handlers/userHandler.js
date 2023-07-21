const { default: mongoose } = require("mongoose");
const { queries } = require("../db");
const { Vote, User } = require("../model");
const { cloudinary } = require('../config/cloudinary');
// const gfs = require("../db");

let gfs;


mongoose.connect(process.env.MONGO_URL, (err, conn) => {
	if (err) {
		console.log('Mongo error ', err);
	} else {
		// conn.once('open', () => {
		// 	gfs = Grid(conn.db, mongoose.mongo);
		// 	gfs.collection('uploads')
		// })
		let db = mongoose.connections[0].db;
		gfs = new mongoose.mongo.GridFSBucket(db, {
			bucketName: 'uploads'
		})
		console.log('Mongoose Connection is Successful');
	}
});

const user = {
    getDashboard: async (my_details, next) => {
        try {
            console.log(my_details)
            let condition = { userId: mongoose.Types.ObjectId(my_details._id) };
            let projection = { id: 1, votersID: 1 };
            let option = { lean: true };

            const voted = await queries.findOne( Vote, condition, projection, option );

            if(voted || my_details.userType === 'admin') {
                // GET ALL VOTES
                let pipeline = [
                    { $match: {} },
                    { $group: { _id: '$party', count: { $sum: 1}}},
                    { $sort: { createdDate: -1 }},
                ];

                let populateOptions = {
                    path: 'userId',
                    select: 'firstName',
                }
                const votesByParty = await queries.aggregateDataAndPopulate(Vote, pipeline, populateOptions);

                pipeline = [
                    { $match: {} },
                    { $group: { _id: '$state', count: { $sum: 1}}},
                    { $sort: { createdDate: -1 }},
                ];
                
                const votesByState = await queries.aggregateDataAndPopulate(Vote, pipeline, populateOptions);

                const totalVotes = await queries.countDocuments( Vote, pipeline[0].$match );
                return {
                    status: 200,
                    data: { totalVotes, votesByParty, votesByState }
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
            let parties = [ 'NPC', 'YAP', 'APPA', 'CP', 'NNPC' ]
            console.log(voteDetails, 'vD')

            if(!parties.includes(voteDetails.party)) {
                return {
                    status: 400,
                    data: { msg: 'Invalid party' }
                }
            }

            let voteObj = {
                userId: my_details._id,
                party: voteDetails.party,
                state: my_details['State of Origin']
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

    getProfile: async (my_details) => {
        try {
            let condition = { email: my_details.email };
            let projection = { password: 0, OTP: 0, resetToken: 0, resetTokenExpiration: 0, createdDate: 0, lastLogin: 0 };
            let option = { lean: true };

            let profile = await queries.findOne( User, condition, projection, option);
            return {
                status: 200,
                data: { profile }
            }
        } catch (err) {
            return {
                status: 400,
                data: { msg: err.message }
            }
        }
    },

    getFile: async (res, filename) => {
        try {
            // console.log(gfs, 'gfs')
            // res.redirect('http://res.cloudinary.com/iceece/image/upload/v1672908699/passport/mnifb7zvxh3p6mfyqjus.png');

            gfs.find({filename: filename}).toArray((err, file) => {
                if(err) {
                    res.status(400).json({msg: err.message});
                } else {
                    
                    console.log(file)
                    const type = file[0].contentType
                    res.set("Content-Type", type)
                    gfs.openDownloadStreamByName(filename).pipe(res)
                }
                
            });

        } catch (error) {
            res.status(400).json(error)
        }
    },

    updateFile: async (next, my_details, id, files) => {

        try {
            if(!files) return { status: 402, data: { msg: 'You need to upload a file'}}

            const userr = await User.findById(my_details._id);
            
            let update;
            if(files.passport && files['Birth Certificate']) {

                update = {
                    passport: {
                        passportID: files['passport'][0].id,
                        path: files['passport'][0].filename
                    },
                    'Birth Certificate': {
                        'Birth CertificateID': files['Birth Certificate'][0].id,
                        path: files['Birth Certificate'][0].filename
                    }
                }
            } else if(files.passport) {
                update = {
                    passport: {
                        passportID: files['passport'][0].id,
                        path: files['passport'][0].filename
                    }
                }
            } else {
                update = {
                    'Birth Certificate': {
                        'Birth CertificateID': files['Birth Certificate'][0].id,
                        path: files['Birth Certificate'][0].filename
                    }
                }
            }
            Object.assign(userr, update);
            await userr.save();

            const deletePrevFile = await user.deleteImage(id);
            console.log(deletePrevFile)
            if(deletePrevFile.status === 200) {

                return {
                    status: 200,
                    data: { msg: 'Updated'}
                }
            }
            return deletePrevFile

        } catch (err) {
            throw err
            // next(err)
        }
    },

    deleteImage: async (id) => {
        if (!id || id === 'undefined') return res.status(400).send('No image ID');
        const _id = new mongoose.Types.ObjectId(id);
        const deleted = await gfs.delete(_id, (err) => {
          if (err) return {
            status: 500,
            data: { msg: 'image deletion error', err}
          }
          console.log('file deleted');
          return {
            status: 200,
            data: { msg: 'File deleted'}
          }
        });
        return deleted;
    }
};

module.exports = user;