const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);

// const url = `mongodb://${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

// Create mongo connection
// const conn = mongoose.createConnection(process.env.MONGO_URL);

// Init gfs
let gfs;

// conn.once('open', () => {
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection('uploads')
// })

mongoose.connect(process.env.MONGO_URL, (err, conn) => {
	if (err) {
		console.log('Mongo error ', err);
	} else {
		// console.log(conn);
		// console.log('************');
		// console.log(mongoose.connection)
		conn.once('open', () => {
			gfs = Grid(conn.db, mongoose.mongo);
			gfs.collection('uploads')
		})
		console.log('Mongoose Connection is Successful');
	}
});

// mongoose.connection.once('open', () => {
// 	console.log('Hello')
// 	const gfs = Grid(mongoose.connection.db, mongoose.mongo);
// 	// use gfs here
// });

mongoose.connection.on('open', () => {
	module.exports = gfs;
});

  