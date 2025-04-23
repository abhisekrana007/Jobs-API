const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must provide a name'],
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Must provide a password'], // Fixed typo here
    minlength: 6, // Increased minimum length for security
    select: false
  },
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function() {
  return jwt.sign(
    { userId: this._id, name: this.name, email: this.email }, // Standardized userId
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

UserSchema.methods.comparePassword = async function(candidatePassword) {
  // 1. Validate input
  if (!candidatePassword || typeof candidatePassword !== 'string') {
    throw new Error('Invalid password format');
  }

  // 2. Ensure password is available for comparison
  if (!this.password) {
    throw new Error('User password not loaded');
  }

  // 3. Perform comparison
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);