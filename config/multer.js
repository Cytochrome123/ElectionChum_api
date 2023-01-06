const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/uploads/passport');
//     },
//     filename: (req, file, cb) => {
//         const {originalname} = file;
//         cb(null, originalname)
//     }
// });

const storage = multer.diskStorage({})

const upload = multer({storage});

module.exports = { upload };