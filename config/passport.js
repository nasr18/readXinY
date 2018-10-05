const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('Users');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // 'user[email]',
      passwordField: 'password', // 'user[password]',
    },
    (email, password, done) => {
      Users.findOne({ email })
        .then(user => {
          if (!user) return done(null, false, 'User not found!');

          if (!user.validatePassword(password))
            return done(null, false, 'email or password is invalid');

          return done(null, user);
        })
        .catch(done);
    }
  )
);
