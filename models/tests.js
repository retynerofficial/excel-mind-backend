const mongoose = require("mongoose");

const { Schema } = mongoose;

const testSchema = Schema({
  course: {
    type: String,
    required: true
    // unique: true
  },
  // questionData: {
  // type: [{
  topic: { type: String, required: true },
  subTopics: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: Array, required: true, default: true },
  answer: { type: String, required: true }
  // }],
  // default: []
  // }
});

module.exports = mongoose.model("test", testSchema);
