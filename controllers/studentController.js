const Student = require("../models/Student");
const Users = require("../models/users");
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
