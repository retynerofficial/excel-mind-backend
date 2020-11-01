const mongoose = require("mongoose");
const pluginvalid = require("mongoose-beautiful-unique-validation");

const { Schema } = mongoose;

const tempGrade = Schema({
  // _id: { type: Schema.Types.ObjectId },
  testId: { type: Schema.Types.ObjectId, ref: "finalTest", required: true },
  userId: { type: String, ref: "users", required: true },
  gradeDetails: { type: Array, default: [] }
});
tempGrade.plugin(pluginvalid);

module.exports = mongoose.model("tempGrade", tempGrade);
