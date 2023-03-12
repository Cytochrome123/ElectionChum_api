const {GridFsStorage} = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto')
const path = require('path');


const storage = new GridFsStorage({
    url: process.env.MONGO_URL,
    options: { useUnifiedTopology: true },
    file: (req, file, err) => {
        if(!file) return err
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
            if (err) {
                return reject(err);
            }
            const filename = buf.toString('hex') + path.extname(file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            // console.log(fileInfo)
            resolve(fileInfo);
            });
        });
    }
});
  
const upload = multer({
    storage,
    limits: { fileSize: 20000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    }
});

function checkFileType(file, cb) {
    // if(!file) return cb(null, false);
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb('filetype');
}

const uploadMiddleware = (req, res, next) => {
    const store = upload.fields([{name: 'passport', maxCount: 1}, {name: 'Birth Certificate', maxCount: 1}]);
    store(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send('File too large');
        } else if (err) {
            if (err === 'filetype') return res.status(400).send('Image files only');
            return res.sendStatus(500);
        }
        next();
    })
}

module.exports = { upload, uploadMiddleware };