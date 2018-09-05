const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  username: { type: String, required: true, index: true },
  name: { type: String },
  email: { type: String, required: true, index: true },
  password: { type: String, required: true },
});

UsersSchema.methods.setPassword = function(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.password, 10000, 512, 'sha512').toString('hex');
  return this.password === hash;
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    process.env.jwt_secret
  );
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
  };
};

mongoose.model('Users', UsersSchema);
