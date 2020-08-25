/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const adminSchema = Schema({
  adminId: {
    type: Object
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("admin", adminSchema);
