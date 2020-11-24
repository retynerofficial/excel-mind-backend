const mongoose = require("mongoose");

const { Schema } = mongoose;

const questionBankSchema = Schema({
  course: {
    type: String,
    required: true
    // unique: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model("questionBank", questionBankSchema);
