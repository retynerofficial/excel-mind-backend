/* eslint-disable linebreak-style */
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

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
    /**
    ***TODO :: the role should be capitalized to  reduce user error from the frontend
     */
    // eslint-disable-next-line no-prototype-builtins
    if (!Roles.hasOwnProperty(role)) {
      return res.status(400).json({ response: "this role doesn't exist" });
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
    // Check user role andpopulate different collectio
    /* TODO :: send only the user's role to the function not the user object for
    optimization purpose.
    */

    checkRole(createUser);

    // Save User to Database
    await createUser.save();

    const loginLink = "http://excelminds.com";
    // send a welcome mail to the user
    const options = {
      receiver: email,
      subject: "EMPS SIGNUP WELCOME MESSAGE",
      text: "WELCOME!!!",
      output: generateMailForSignup(loginLink, firstname, email)
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

exports.addProfilePics = async (req, res) => {
  try {
    const { _id } = req.user;
    // Collecting the profile_pics from req.file
    const profilePics = req.file.path;
    // console.log(profilePics)
    if (!profilePics) return res.status(404).json({ error: "Image is not found" });

    // upload to cloudinary and get generated link
    const picsLink = await cloudinary.uploader.upload(
      profilePics,
      (error, result) => {
        if (error) res.status(400).json({ error });
        return result;
      }
    );
    if (picsLink) fs.unlinkSync(profilePics);
    // Find users and upload profile picture to DB
    const uploadPics = await users.findOneAndUpdate({ _id }, { profile_picture: picsLink.url });
    if (!uploadPics) res.status(400).json({ error: "Image is saved" });
    return res.status(200).json({ success: "profile picture uploaded", picture_url: uploadPics.profile_picture });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.testRead = (req, res) => {
  const changeStream = users.watch();
  changeStream.on("change", (next) => {
    console.log(next);
  });
};
