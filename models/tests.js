const mongoose = require("mongoose");

const { Schema } = mongoose;

const testSchema = Schema({
  course: {
    type: String,
    required: true
    // unique: true
  },
  questionData: {
    type: [{
      topic: String,
      subTopics: String,
      question: String,
      options: []
    }],
    default: []
  }
});

module.exports = mongoose.model("test", testSchema);
