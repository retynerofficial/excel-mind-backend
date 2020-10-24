const Student = require("../models/Student");
const Users = require("../models/users");
const Class = require("../models/class");
const { generateMailForInvite } = require("../services/email/mailhelper");
const mailingService = require("../services/email/mailingservice");

exports.getEmail = async (req, res) => {
  const { email } = req.body;
  const { _id } = req.user;
  try {
    const student = await Student.findOne({ studentId: _id });
    const { studentKey } = student; // Find studentKey in Student collection
    const users = await Users.findOne({ _id });
    const name = `${users.firstname} ${users.lastname}`;
    const loginLink = "https://excelmind.com/users/login";

    // send an invitation message to parent/gaurdian
    const options = {
      receiver: email,
      subject: "YOU ARE HAVE BEEN INVITED BY YOUR WARD",
      text: "WELCOME!!!",
      output: generateMailForInvite(loginLink, email, studentKey, name)
    };
    await mailingService(options);
    return res.status(200).json({ response: "Sucessfully sent" });
  } catch (error) {
    return res.status(400).json({ response: error });
  }
};

exports.joinClass = async (req, res) => {
  try {
    const { _id } = req.user;
    // receive class_id from url params
    const { classCode } = req.params;

    // Search if student is DB
    const User = await Users.findById({ _id });
    if (!User) {
      return res.status(404).json({ error: "Student not Logged In" });
    }
    if (User.role !== "student") {
      return res.status(404).json({ error: "only a student can join this class" });
    }
    // Store Student Info in Object
    const studentInfo = {
      firstname: User.firstname,
      lastname: User.lastname,
      UserId: User._id
    };

    // Add student to join class
    const updateClass = await Class.updateOne(
      { classCode }, { $addToSet: { student: studentInfo } }
    );

    if (!updateClass) res.status(400).json({ error: "student joined" });
    return res.status(200).json({ response: "Student sucessfully join" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
