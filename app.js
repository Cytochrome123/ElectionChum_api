require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const passportLocalStrategy = require('./auth/passport');
passportLocalStrategy(passport);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SG_API_KEY)
// const otpMap = require('./auth/passport');

const { auth, admin, user } = require('./routes');
const db = require('./db');
console.log(db)


const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',
    // origin: ["http://localhost:3000", 'https://exam-mgt-server.herokuapp.com'], // allow to server to accept request from different origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true, // allow session cookie from browser to pass through
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
}));  

app.use(session({
    secret: 'Election',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', auth());
app.use('/api', admin());
app.use('/api', user());

app.use((err, req, res, next) => {
  // Handle the error
  res.status(500).json({ error: err.message });
});

app.listen(process.env.PORT || 5000, (err) => {
    if (err) console.log(err);
    else console.log('Server Connected!!!');
});
