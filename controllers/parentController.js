/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const { Error } = require("mongoose");
const Parent = require("../models/parent");
const Student = require("../models/Student");
const Result = require("../models/results");
const finalTest = require("../models/finalTest");

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
    };
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
    if (parent.wards.length < 1) return res.status(200).json({ response: "No added student yet!" });
    return res.status(200).json({ response: "Ward List", ward: parent.wards });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.wardResult = async (req, res) => {
  const { student_id, testId } = req.body;
  try {
    const result = await Result.findOne({ userId: student_id, testId });
    if (!result) return res.status(404).json({ response: "No score" });
    console.log(result);
    return res.status(200).json({ response: result });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.getStudentTest = (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(422).json({ response: "student is required" });
    const getTest = finalTest.find({ candidates: { $elemMatch: { studentId } } });
    console.log(getTest);
    if (getTest.length < 1) {
      return res.status(200).json({ response: "this student hasnnt registered for any test yes" });
    }
    return res.status(200).json({ response: getTest });
  } catch (error) {
    return res.status(500).json({ response: error });
  }
};
