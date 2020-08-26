/* eslint-disable linebreak-style */
const users = require("../models/users");
const {
  hashPassword,
  isPasswordValid,
  tokengen
} = require("../helpers/authHelper");
const checkRole = require("../helpers/roleHelper");

const { generateMailForSignup } = require("../services/email/mailhelper");
const mailingService = require("../services/email/mailingservice");
const { Roles } = require("../helpers/constants");

exports.signUp = async (req, res) => {
  try {
    const {
      email, password, firstname, lastname, role
    } = req.body;

    if (!email || !password || !firstname || !lastname || !role) {
      return res.status(403).json({ response: "one the fields is empty" });
    }
    // check if role provided exists on our list of roles
    // eslint-disable-next-line no-prototype-builtins
    if (!Roles.hasOwnProperty(role)) {
      return res.status(400).json({ response: "this role doesnt exist" });
    }
    // change the role
    const finishedrole = Roles[role];
    // check if the mail doesnt exist b4
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ response: "email exists, please user a different one" });
    }

    // hashpassword b4 saving to db
    const hash = await hashPassword(password);

    // save the user details
    const createUser = users({
      email,
      firstname,
      lastname,
      role: finishedrole,
      password: hash
    });
    // Check user role andpopulate different collection
    checkRole(createUser);

    // Save User to Database
    await createUser.save();

    const loginLink = "https://excelmind.com/users/login";
    // send a welcome mail to the user
    const options = {
      receiver: email,
      subject: "EMPS SIGNUP WELCOME MESSAGE",
      text: "WELCOME!!!",
      output: generateMailForSignup(loginLink, email)
    };
    await mailingService(options);
    return res
      .status(201)
      .json({ response: "user credentials succesfully saved", data: createUser });
  } catch (error) {
    return res.status(500).json({ response: `error ${error} occured` });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await users.findOne({ email });
    if (!user || user.length < 1) {
      return res
        .status(404)
        .json({ response: "User with this email not found" });
    }
    const checkPassword = await isPasswordValid(user.password, password);
    if (!checkPassword) {
      return res.status(403).json({ response: "wrong password" });
    }

    // eslint-disable-next-line no-underscore-dangle
    const token = await tokengen({ userId: user._id });

    return res.status(200).json({ response: "Auth succesfull", token });
  } catch (error) {
    return res.status(500).json({ response: "Auth failed" });
  }
};
