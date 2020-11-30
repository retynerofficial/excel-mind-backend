const mongoose = require("mongoose");

const { Schema } = mongoose;

const testSchema = Schema({
  course: {
    type: String,
    required: true
  },
  questionId: { type: String, required: true },
  topic: { type: String, required: true },
  subTopics: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: Array, required: true, default: true },
  image: { type: String },
  answer: { type: String, required: true }
});

module.exports = mongoose.model("test", testSchema);
