/* eslint-disable linebreak-style */
const Parent = require("../models/parent");
const Student = require("../models/Student");

exports.addWard = async (req, res) => {
  const { studentKey } = req.body;
  const { userId } = req.params;
  console.log(userId, studentKey);
  try {
    const parent = await Parent.findOne({ parentId: userId });
    console.log("parent", parent);
    const student = await Student.findOne({ studentKey });
    console.log("student", student);
    if (!student) return res.status(400).send({ response: "student is not found" });
    console.log(parent, student);
    parent.wards.push(student.studentKey);
    parent.save();
    console.log(parent);
    return res.status(200).send("Sucessfully sent");
  } catch (error) {
    return res.send(400).send(error);
  }
};
