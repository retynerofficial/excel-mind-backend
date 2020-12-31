/* eslint-disable linebreak-style */
// const shortid = require("shortid");
const { nanoid } = require("nanoid")

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
    default: nanoid()
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("student", studentSchema);
