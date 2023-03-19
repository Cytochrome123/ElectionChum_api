const { check } = require('express-validator');

const registerValidation = [
    // check('name', 'Name is required').not().isEmpty(),
    check('password', 'Passowrd must be'),
    check('passport').custom( ( value, {req} ) => {
        console.log(value)
        if(req.files.passport[0].mimetype === 'image/jpeg') return true
        return false;
    }).withMessage('Please upload ur passport'),
    check('Birth Certificate').custom( ( value, {req} ) => {
        console.log(value)
        if(req.files['Birth Certificate'][0].mimetype === 'image/jpeg' || req.files['Birth Certificate'][0].mimetype === 'image/png') return true
        return false;
    }).withMessage('Please upload ur passport'),
];

module.exports = registerValidation;