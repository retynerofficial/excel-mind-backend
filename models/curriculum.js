/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const curriculumSchema = Schema({
  classid: {
    type: String
  },
  curriculum: {
    type: String
  },
  course: {
    type: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("curriculum", curriculumSchema);
