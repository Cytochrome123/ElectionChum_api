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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Origin",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
})
// app.use(cors());
app.use(cors({
    origin: "http://localhost:3000/",
    // origin: ["http://localhost:3000", 'https://exam-mgt-server.herokuapp.com'], // allow to server to accept request from different origin
    // [Access-Control-Allow-Origin]: *,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
    optionsSuccessStatus: 200,

}))

app.use(session({
    secret: 'Election',
    resave: false,
    saveUninitialized: false,
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