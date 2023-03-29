const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);


// Create mongo connection
// const conn = mongoose.createConnection(process.env.MONGO_URL);

// Init gfs
// let gfs;

mongoose.connect(process.env.MONGO_URL, (err, conn) => {
	if (err) {
		console.log('Mongo error ', err);
	} else {
		// conn.once('open', () => {
		// 	gfs = Grid(conn.db, mongoose.mongo);
		// 	gfs.collection('uploads')
		// })
		console.log('Mongoose Connection is Successful');
	}
});