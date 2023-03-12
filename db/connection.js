const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);

// const url = `mongodb://${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

// Create mongo connection
// const conn = mongoose.createConnection(process.env.MONGO_URL);

// Init gfs
// let gfs;

mongoose.connect(process.env.MONGO_URL, (err, conn) => {
	if (err) {
		console.log('Mongo error ', err);
	} else {
		// console.log(conn);
		// console.log('************');
		// console.log(mongoose.connection)
		// conn.once('open', () => {
		// 	gfs = Grid(conn.db, mongoose.mongo);
		// 	gfs.collection('uploads')
		// })
		console.log('Mongoose Connection is Successful');
	}
});

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

// mongoose.connection.once('open', () => {
// 	console.log('Hello')
// 	const gfs = Grid(mongoose.connection.db, mongoose.mongo);
// 	// use gfs here
// });
// export default gfs
// mongoose.connection.on('open', () => {
// 	module.exports = gfs;
// });
