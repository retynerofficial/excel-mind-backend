/* eslint-disable import/no-unresolved */
const shortid = require("shortid");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const classSchema = Schema({
  className: {
    type: String
  },
  classCode: {
    type: Object,
    default: shortid.generate()
  },
  creatorId: {
    type: Object
  },
  pictureUrl: {
    type: String
  },
  student: {
    type: Array,
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("class", classSchema);
