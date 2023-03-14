require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const passportLocalStrategy = require('./auth/passport');
passportLocalStrategy(passport);

const { auth, admin, user } = require('./routes');
const db = require('./db');

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.header(
//         "Access-Control-Allow-Origin",
//         "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
// })
// app.use(cors());
app.use(cors({
    origin: '*',
    // origin: ["http://localhost:3000", 'https://exam-mgt-server.herokuapp.com'], // allow to server to accept request from different origin
    [Access-Control-Allow-Origin]: '*',
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
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


app.listen(process.env.PORT || 5000, (err) => {
    if (err) console.log(err);
    else console.log('Server Connected!!!');
});



// const express = require('express');
// const twilio = require('twilio');
// const jwt = require('jsonwebtoken');
// const router = express.Router();

// router.post('/login', (req, res) => {
//     const {username, password} = req.body;

//     // Verify credentials against the database
//     if (username === 'valid_username' && password === 'valid_password') {
//         // Generate a one-time code
//         const oneTimeCode = Math.floor(Math.random() * 1000000);
//         // Generate a token
//         const token = jwt.sign({username}, process.env.JWT_SECRET);

//         // Send the code via SMS using Twilio
//         const client = new twilio(accountSid, authToken);
//         client.messages.create({
//             to: '+1234567890', // User's registered mobile number
//             from: '+0987654321', // Twilio phone number
//             body: `Your one-time code is ${oneTimeCode}`
//         })
//         .then(() => {
//             // Save the one-time code and token in cache
//             cache.set(token, oneTimeCode, 'EX', 60);
//             res.json({status: 'success', token});
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).json({status: 'error', message: 'Failed to send SMS'});
//         });
//     } else {
//         res.status(401).json({status: 'error', message: 'Invalid credentials'});
//     }
// });

// router.post('/verify-code', (req, res) => {
//     const {oneTimeCode, token} = req.body;

//     // Verify the entered code and token against the cache
//     if (oneTimeCode === cache.get(token)) {
//         // Clear the one-time code and token from the cache
//         cache.del(token);
//         // Generate
