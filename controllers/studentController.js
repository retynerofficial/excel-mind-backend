/* eslint-disable linebreak-style */
const Student = require("../models/Student");
const Users = require("../models/users");
const { generateMailForInvite } = require("../services/email/mailhelper");
const mailingService = require("../services/email/mailingservice");

exports.getEmail = async (req, res) => {
  const { email } = req.body;
  const { userId } = req.params;
  console.log(userId, email);
  try {
    const student = await Student.findOne({ studentId: userId });
    const { studentKey } = student; // Find studentKey in Student collection
    const users = await Users.findOne({ _id: userId });
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
    return res.status(200).send("Sucessfully sent");
  } catch (error) {
    return res.send(400).send(error);
  }
};
