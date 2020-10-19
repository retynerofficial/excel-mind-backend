/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const resourceSchema = Schema({
  uploader: {
    type: String
  },
  classid: {
    type: String
  },
  resourceLink: {
    type: String
  },
  resourceType: {
    type: String
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("resource", resourceSchema);
