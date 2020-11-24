const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  state: {
    type: String
  },
  role: {
    type: String,
    required: true
  },
  profile_picture: {
    type: String
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("users", userSchema);
