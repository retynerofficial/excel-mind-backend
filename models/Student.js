/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const studentSchema = Schema({
  studentId: {
    type: Object
  },
  parentid: {
    type: String
  },
  studentKey: {
    type: String
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("student", studentSchema);
