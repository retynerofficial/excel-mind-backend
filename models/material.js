/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const materialSchema = Schema({
  classid: {
    type: String
  },
  material: {
    type: Array
  },
  creatorId: {
    type: Object
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("material", materialSchema);
