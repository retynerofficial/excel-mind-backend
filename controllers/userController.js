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

    return res.status(200).json({ response: "Auth succesfull", role: user.role, token });
  } catch (error) {
    return res.status(500).json({ response: "Auth failed" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    // Collecting the  class-name  from the body
    const { address, phone, state } = req.body;

    // Collecting the profile_pics from req.file
    console.log(req.body, req.files);
    if (!req.file) return res.status(404).json({ response: "Image is not found at all" });
    const profilePics = req.file.path;
    if (!profilePics) return res.status(404).json({ response: "Image is not found" });

    // upload to cloudinary and get generated link
    const picsLink = await cloudinary.uploader.upload(
      profilePics,
      (error, result) => {
        if (error) {
          fs.unlinkSync(profilePics);
          return res.status(400).json({ error });
        } 
        // if (error.code === "ENOTFOUND") {
        //   return res.status(400).json({ error: "Unable to upload you pics, please connect to the internet" });
        // }
        return result;
      }
    );
    if (picsLink) fs.unlinkSync(profilePics);

    // Find users and upload profile picture to DB
    const uploadPics = await users.findOneAndUpdate({ _id }, {
      profile_picture: picsLink.url,
      address,
      phone,
      state
    });
    if (!uploadPics) return res.status(400).json({ error: "Image is not saved" });
    // Get
    const allProfile = await users.findById({ _id });
    return res.status(200).json({ success: "profile updated", response: allProfile });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.Profile = async (req, res) => {
  try {
    // User info from the JWT
    console.log(req.user);
    const { _id } = req.user;

    // Fetch all class
    const User = await users.findById({ _id }, { password: 0 });
    return res.status(200).json({ User });
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
