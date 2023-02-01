const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// const connn = mongoose.createConnection(process.env.MONGO_URL);

// // Init gfs
// let gfs;

// connn.once('open', () => {
//     gridfsBucket = new mongoose.mongo.GridFSBucket(connn.db, {
//         bucketName: 'uploads'
//       })
//     gfs = Grid(connn.db, mongoose.mongo);
//     gfs.collection('uploads');
// 	console.log('Mongoose Connection is Successful');
// 	// console.log(gfs)
// })

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);

// const url = `mongodb://${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

// Create mongo connection
// const connn = mongoose.createConnection(process.env.MONGO_URL);

// // Init gfs
// let gfs;

// connn.once('open', () => {
//     gfs = Grid(connn.db, mongoose.mongo);
//     gfs.collection('uploads');
// 	console.log('Mongoose Connection is Successful');
// 	// console.log(gfs)
// 	module.exports = gfs;
// 	mongoose.connect(process.env.MONGO_URL)
// })

// const mongoose = require('mongoose');

// // Connect to the MongoDB instance
// mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
// const conn = mongoose.connection;

// conn.once('open', () => {
//   // Initialize the gridfs-stream
//   const gfs = new mongoose.mongo.GridFSBucket(conn.db);

//   module.exports = gfs;
// });


mongoose.connect(process.env.MONGO_URL, (err, conn) => {
	if (err) {
	  console.log('Mongo error ', err);
	} else {
	  conn.once('open', () => {
		console.log('Mongoose Connection is Successful');
	  });
	}
  });
  
//   mongoose.connection.on('open', () => {
// 	console.log('here')
// 	module.exports = gfs;
//   });