const mongoose = require("mongoose");

const { Schema } = mongoose;

const finalTest = Schema({
  course: { type: String, required: true },
  candidates: { type: Array, default: [] },
  timer: { type: Number, required: true },
  classId: { type: Schema.Types.ObjectId, ref: "class", required: true },
  testDetails: { type: Array, required: true },
  closed: { type: Boolean, default: false },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("finalTest", finalTest);
