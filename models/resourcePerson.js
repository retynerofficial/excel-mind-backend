/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const resourcePersonSchema = Schema({
  userId: {
    type: Object
  },
  course: {
    type: Object
  },
  studentList: {
    type: Array
  },
  listLength: {
    type: Boolean,
    default: false
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("resource_person", resourcePersonSchema);
