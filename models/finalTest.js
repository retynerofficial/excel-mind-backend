const mongoose = require("mongoose");

const { Schema } = mongoose;

const finalTest = Schema({
  course: { type: String, required: true },
  candidates: { type: Array, default: [] },
  timer: { type: Number, required: true },
  classId: { type: Schema.Types.ObjectId, ref: "CLASS", required: true },
  testDetails: { type: Array, required: true },
  status: { type: Boolean, default: false }

});

module.exports = mongoose.model("finalTest", finalTest);
