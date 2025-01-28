const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    default: 'normal'
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  parallel: {
    type: String,
    required: true
  },
  career: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
