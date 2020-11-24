/* eslint-disable linebreak-style */
const shortid = require("shortid");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const studentSchema = Schema({
  studentId: {
    type: String
  },
  parentid: {
    type: String
  },
  studentKey: {
    type: String,
    default: shortid.generate()
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("student", studentSchema);
