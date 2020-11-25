const mongoose = require("mongoose");
const pluginvalid = require("mongoose-beautiful-unique-validation");

const { Schema } = mongoose;

const commentSchema = Schema({
  virclassId: { type: Schema.Types.ObjectId, ref: "virtualClass", reqiured: true },
  commenter: { type: Schema.Types.ObjectId, ref: "users", reqiured: true },
  comment: { type: String, required: true },
  commentType: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now }

});
commentSchema.plugin(pluginvalid);

module.exports = mongoose.model("comments", commentSchema);
