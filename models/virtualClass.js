const mongoose = require("mongoose");
const pluginvalid = require("mongoose-beautiful-unique-validation");

const { Schema } = mongoose;

const virtualClassSchema = Schema({
  topic: { type: String, required: true },
  videoLink: { type: String, required: true },
  students: { type: Array, default: [] },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  tutor: { type: Schema.Types.ObjectId, ref: "users", required: true },
  dateCreated: { type: Date, default: Date.now }

});

virtualClassSchema.plugin(pluginvalid);

module.exports = mongoose.model("virtualClass", virtualClassSchema);
