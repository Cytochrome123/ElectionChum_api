const { check, body } = require('express-validator');

const registerValidation = [
    body('email', 'Email is required').not().isEmpty(),
    body('password', 'Passowrd must be'),
    check('passport').custom( ( value, {req} ) => {
        console.log(value)
        console.log(req.files.passport, 'validation')
        // if(req.files.passport[0].mimetype === 'image/jpeg') return true
        if(req.files.passport) return true
        return false;
    }).withMessage('Please upload ur passport'),
    check('Birth Certificate').custom( ( value, {req} ) => {
        console.log(value)
        // if(req.files['Birth Certificate'][0].mimetype === 'image/jpeg' || req.files['Birth Certificate'][0].mimetype === 'image/png') return true
        if(req.files['Birth Certificate']) return true
        return false;
    }).withMessage('Birth Certificate is required'),
];

module.exports = registerValidation;