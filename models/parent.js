/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const parentSchema = Schema({
  parentId: {
    type: String
  },
  wards: {
    type: [{}]
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("parent", parentSchema);
