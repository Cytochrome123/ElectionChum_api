// const { default: mongoose } = require("mongoose");
const { queries } = require("../db");
const { Vote, User } = require("../model");
const { cloudinary } = require('../config/cloudinary');
// const gfs = require("../db");

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

    getFile: async (res, id) => {
        try {
            console.log(gfs)
            // res.redirect('http://res.cloudinary.com/iceece/image/upload/v1672908699/passport/mnifb7zvxh3p6mfyqjus.png');

            gfs.find({_id: mongoose.Types.ObjectId(id)}).toArray((err, file) => {
                if (!id || id === 'undefined') return res.status(400).send('No ID');
                if (!file || file.length === 0) {
                  return res.status(404).json({
                    message: 'File not found'
                  });
                }
                console.log(file);
                // const readstream = gfs.createReadStream(file.filename);
                // readstream.pipe(res);
            
                const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(id))
            
                downloadStream.on('error', (error) => {
                  console.log('Error downloading file:', error);
                  res.sendStatus(404);
                });
            
                downloadStream.pipe(res);
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
            res.status(400).json(error.message)
        }
    },

    updateFile: async (next, my_details, id, files) => {
        /**
         * find the user with either auth or
         * id of the file to change
         * update the users data with the newly updated file-- if passport, if cert.length
         * delete the old file by id
         */

        try {
            if(!files) return { status: 402, data: { msg: 'You need to upload a file'}}

            const userr = await User.findById(my_details._id);
            // if(!userr) {}
            // if(userr.passport.passportID !== id || userr["Birth Certificate"]["Birth CertificateID"] !== id) {};
            // console.log(files)
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
            // console.log(user)
            // console.log(Object.values(user))
            Object.assign(userr, update);
            await userr.save();
            // console.log(user)

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