/* eslint-disable linebreak-style */
const Parent = require("../models/parent");
const Student = require("../models/Student");

exports.addWard = async (req, res) => {
  const { studentKey } = req.body;
  const { _id } = req.user;
  try {
    const parent = await Parent.findOne({ parentId: _id });
    const student = await Student.findOne({ studentKey });
    if (!student) return res.status(404).json({ response: "student is not found" });
    parent.wards.push(student.studentKey);
    parent.save();
    return res.status(200).json({ response: "Sucessfully sent" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};
