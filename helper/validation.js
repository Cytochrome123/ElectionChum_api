const { check, body } = require('express-validator');

const registerValidation = [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Passowrd must be'),
    // body('passport').custom( ( value, {req} ) => {
    //     console.log(value)
    //     // if(req.files.passport[0].mimetype === 'image/jpeg') return true
    //     if(req.files.passport[0].mimetype) return true
    //     return false;
    // }).withMessage('Please upload ur passport'),
    // check('Birth Certificate').custom( ( value, {req} ) => {
    //     console.log(value)
    //     // if(req.files['Birth Certificate'][0].mimetype === 'image/jpeg' || req.files['Birth Certificate'][0].mimetype === 'image/png') return true
    //     if(req.files['Birth Certificate'][0].mimetype) return true
    //     return false;
    // }).withMessage('Birth Certificate is required'),
];

module.exports = registerValidation;