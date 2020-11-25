const mongoose = require("mongoose");
const pluginvalid = require("mongoose-beautiful-unique-validation");

const { Schema } = mongoose;

const result = Schema({
  unsolved: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  percent: { type: Number, required: true },
  testId: { type: Schema.Types.ObjectId, ref: "finalTest", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true }
});
result.plugin(pluginvalid);

module.exports = mongoose.model("result", result);
