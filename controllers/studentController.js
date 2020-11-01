const Student = require("../models/Student");
const Users = require("../models/users");
const Class = require("../models/class");
const ResourcePerson = require("../models/resourcePerson");
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

exports.pickRP = async (req, res) => {
  try {
    const { _id } = req.user;
    const { userid } = req.params;
    // Search if student is DB
    const User = await Users.findById({ _id });
    if (!User) {
      return res.status(404).json({ error: "not Logged In" });
    }
    if (User.role !== "student") {
      return res.status(404).json({ error: "only a student can pick resource person" });
    }
    // Store Student Info in Object

    // check if the resourse person is fully booked
    const ResP = await ResourcePerson.findOne({ userid });

    if (ResP.studentList.length === 9) {
      const updateRes = await ResourcePerson.updateOne(
        { _id }, { listLength: true }
      );
      console.log("I dey", updateRes);
      if (updateRes) return res.status(400).json({ response: "resource person is fully booked" });
    }

    const studentInf = {
      firstname: User.firstname,
      lastname: User.lastname,
      UserId: User._id
    };
    // Add student to resource person list
    const addStudent = await ResourcePerson.findOneAndUpdate(
      { userid }, { $addToSet: { studentList: studentInf } }
    );

    if (!addStudent) res.status(400).json({ error: "error picking resource person" });
    return res.json({ success: `you picked ${addStudent.userInfo.firstname} ${addStudent.userInfo.lastname}` });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
