const users = require("../models/users");
const { hashPassword, isPasswordValid, tokengen } = require("../helpers/authHelper");

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

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await users.findOne({ email });
    if (!user || user.length < 1) {
      return res.status(404).json({ response: "User with this email not found" });
    }
    const checkPassword = await isPasswordValid(user.password, password);
    if (!checkPassword) {
      return res.status(403).json({ response: "wrong password" });
    }
    console.log(process.env.JWTSECRET);

    // eslint-disable-next-line no-underscore-dangle
    const token = await tokengen({ userId: user._id });

    return res.status(200).json({ response: "Auth succesfull", token });
  } catch (error) {
    return res.status(500).json({ response: "Auth failed" });
  }
};
