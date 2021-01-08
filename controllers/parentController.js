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
    const wardInfo = {
      uiqueId: student.studentKey,
      student: student.studentId
    }
    parent.wards.push(wardInfo);
    parent.save();
    return res.status(200).json({ response: "Sucessfully sent", ward: parent.wards });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.wardList = async (req, res) => {
  const { _id } = req.user;
  try {
    const parent = await Parent.findOne({ parentId: _id });
    if (!parent) return res.status(404).json({ response: "parent is not logged in or not found" });
    if(parent.wards.length < 1) return res.status(200).json({ response: "No added student yet!"});
    return res.status(200).json({ response: "Ward List", ward: parent.wards });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
