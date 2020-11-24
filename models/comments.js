const mongoose = require("mongoose");

const { Schema } = mongoose;

const commentSchema = Schema({
  commentId: { type: Schema.Types.ObjectId, ref: "virtualClass", reqiured: true },
  commenter: { type: Schema.Types.ObjectId, ref: "users", reqiured: true },
  comment: { type: String, required: true }

});

module.exports = mongoose.model("comments", commentSchema);
