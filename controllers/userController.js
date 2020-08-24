const users = require("../models/users");
const { hashPassword } = require("../helpers/authHelper");

exports.signUp = async (req, res) => {
  try {
    const {
      email, password, firstname, lastname, role
    } = req.body;
    console.log(email, password, firstname, lastname, role);

    if (!email || !password || !firstname || !lastname || !role) {
      return res.status(403).json({ response: "one the fields is empty" });
    }
    // check if the mail doesnt exist b4
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ response: "email exists, please user a different one" });
    }

    // hashpassword b4 saving to db
    const hash = await hashPassword(password);

    // save the user details

    const createUser = await users.create({
      email, firstname, lastname, role, password: hash
    });
    // TODO
    // send a welcome maile to the user

    return res.status(201).json({ response: "user credentials succesfully saved", createUser });
  } catch (error) {
    return res.status(500).json({ response: `error ${error} occured` });
  }
};
