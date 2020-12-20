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
    type: String,
  },
  address: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  role: {
    type: String,
    required: true
  },
  profile_picture: {
    type: String,
    default: "https://st2.depositphotos.com/4111759/12123/v/950/depositphotos_121233262-stock-illustration-male-default-placeholder-avatar-profile.jpg"
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("users", userSchema);
