const { default: mongoose } = require("mongoose");
const { queries } = require("../db");
const { Vote, User } = require("../model");
const { cloudinary } = require('../config/cloudinary');
// const gfs = require("../db");

let gfs;

// const conn = mongoose.createConnection(process.env.MONGO_URL, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// 	// useCreateIndex: true,
// });

// conn.once('open', () => {
//     gfs = new mongoose.mongo.GridFSBucket(conn.db, {
// 		bucketName: 'uploads',
// 	});
// 	console.log('GFS up!!!')
// })

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

            if(voted) {
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

    getFile: async (res, id) => {
        try {
            console.log(gfs, 'gfs')
            // res.redirect('http://res.cloudinary.com/iceece/image/upload/v1672908699/passport/mnifb7zvxh3p6mfyqjus.png');

            gfs.find({filename: 'f72cfe5dac4824f2406e478ebbd880ae.jpg'}).toArray((err, file) => {
                if(err) {
                    res.status(400).json({msg: err.message});
                } else {
                    // console.log(file, 'file')
                    // if(file || file.length == 0) {
                    //     res.status(202).json({msg: 'file doe not exist'});
                    // } else {
                        console.log(res)
                        gfs.openDownloadStreamByName('f72cfe5dac4824f2406e478ebbd880ae.jpg').pipe(res)
                    // }
                }
                // if (!id || id === 'undefined') return res.status(400).send('No ID');
                // if (!file || file.length === 0) {
                //   return res.status(404).json({
                //     message: 'File not found'
                //   });
                // }
                // console.log(file, 'file');
                // // const readstream = gfs.createReadStream(file.filename);
                // // readstream.pipe(res);
            
                // const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(id))
            
                // downloadStream.on('error', (error) => {
                //   console.log('Error downloading file:', error);
                //   res.sendStatus(404);
                // });
            
                // downloadStream.pipe(res);

                // const fin = downloadStream.pipe(res);
                // console.log(typeof(fin))
                // res.status(200).json({msg: 'Image loaded'});
            });


            // gfs.files.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, (err, file) => {
            //     if (!file || file.length === 0) {
            //       return res.status(404).json({
            //         message: 'File not found'
            //       });
            //     }
            //     const readstream = gfs.createReadStream(file.filename);
            //     readstream.pipe(res);
            
            // })
        } catch (error) {
            res.status(400).json(error)
        }
    },

    updateFile: async (next, my_details, id, files) => {

        try {
            if(!files) return { status: 402, data: { msg: 'You need to upload a file'}}

            const userr = await User.findById(my_details._id);
            // if(!userr) {}
            // if(userr.passport.passportID !== id || userr["Birth Certificate"]["Birth CertificateID"] !== id) {};
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