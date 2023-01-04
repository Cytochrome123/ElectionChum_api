const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');

const {User} = require('../model');
const {queries} = require('../db');
const {factory} = require('../config');



module.exports = (passport) => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'votersID',
                passwordField: 'password'
            },
            async (votersID, password, done) => {
                try {
                    let condition = { votersID };
                    let projections = {};
                    let option = { lean: true };

                    let user = await queries.findOne( User, condition, projections, option );

                    if(user) {
                        if (user.status === 'pending') {
                            return done( null, false, {msg: 'Your account is still pending, check back later.Thanks'})
                        }
                        let correlates = factory.compareHashedPassword(password, user.password);
                        if(correlates) {
                            return done(null, user);
                        }
                        return done(null, false, {msg: 'Incorrect password!!'});
                    }
                    return done(null, false, {msg: 'Your account does\'nt exist'});
                } catch (err) {
                    throw err;
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
		done(null, toString(user._id));
	});
}