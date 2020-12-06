const mongoose = require("mongoose");

const { Schema } = mongoose;
const payerSchema = Schema({
  Student_Name: {
    type: String,
    required: true
  },
  Course_ID: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    required: true
  }
},
{ timestamps: true });
const Payer = mongoose.model("Payer", payerSchema);
module.exports = { Payer };
