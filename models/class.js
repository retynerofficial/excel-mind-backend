/* eslint-disable import/no-unresolved */
// const shortid = require("shortid").generateid;
const { nanoid } = require("nanoid")
const mongoose = require("mongoose");

const { Schema } = mongoose;

const classSchema = Schema({
  course: {
    type: String
  },
  classCode: {
    type: Object,
    default: nanoid(10)
  },
  creatorId: {
    type: Schema.Types.ObjectId, ref: "users", required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number
  },
  duration: {
    type: String
  },
  curriculum: {
    type: String
  },
  creatorPics: {
    type: String
  },
  pictureUrl: {
    type: String
  },
  student: {
    type: Array
  },
  registeredDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("class", classSchema);
