/* eslint-disable linebreak-style */
const mongoose = require("mongoose");
const { object } = require("@hapi/joi");

const { Schema } = mongoose;

const resourceSchema = Schema({
  resourceId: {
    type: Object
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
