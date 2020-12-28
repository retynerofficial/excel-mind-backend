/* eslint-disable no-underscore-dangle */
/* eslint-disable linebreak-style */
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const users = require("../models/users");

const apiKey = process.env.MAILGUNAPIKEY;
const domain = process.env.DOMAIN;
const mailgun = require("mailgun-js")({ domain, apiKey });

const {
  hashPassword,
  isPasswordValid,
  tokengen,
  decodeToken
} = require("../helpers/authHelper");
const checkRole = require("../helpers/roleHelper");
const addUsertoLists = require("../helpers/emailList");

const { generateMailForSignup } = require("../services/email/mailhelper");
const mailingService = require("../services/email/mailingservice");
const { Roles } = require("../helpers/constants");

exports.signUp = async (req, res) => {
  try {
    const {
      email, password, firstname, lastname, role, phone
    } = req.body;


    if (!email || !password || !firstname || !lastname || !role || !phone) {
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
      phone,
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
    const { address, phone, state, profile_picture } = req.body;
    // Find users and upload profile picture to DB
    const uploadProf = await users.findByIdAndUpdate({ _id }, {
      profile_picture,
      address,
      phone,
      state
    });    
    if (!uploadProf) return res.status(400).json({ error: "Profile not updated" });
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
    const { _id } = req.user;

    // Fetch all class
    const User = await users.findById({ _id }, { password: 0 });
    return res.status(200).json({ User });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.newsLetter = async (req, res) => {
  try {
    // User email from the Body
    const { email } = req.body;
    // this function add new subscriber to mailchimp
    const userAdded = await addUsertoLists(email);
    // check if the subscriber was added sucessfully to return a sucess message
    if (userAdded) return res.status(200).json({ sucess: "You Sucessfully Subscribed" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        data: null,
        errors: "User not found"
      });
    }

    const token = await tokengen({ userId: user._id });

    // send the mail here
    const data = {
      from: "contact@emps.com",
      to: `${user.email}`,
      subject: "EPMS App Account Recovery",
      text: "Making Education easy",
      html: `
           <pre>
              <h1> EMPS Account recovery request </h1>
              Hello ${user.firstname},
              We received a request to use EMPS App Account Recovery to regain access to your account. To continue, click this link:
              <a href="${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${token}"> Start EMPS Account Recovery </a>
              The link expires in 2 hours.
              If the link doesn't work, visit this site by copying this address to your browser:
              ${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${token} 
           </pre>
         `
    };
    const message = await mailgun.messages().send(data);
    if (message) {
      return res.status(200).json({
        status: true,
        message: "Email Sent",
        data: message
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: null,
      error: [error]
    });
  }
};

exports.recoverPassword = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(403).json({
        status: false,
        data: "Sorry, you must provide a valid token."
      });
    }
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res.status(422).json({
        status: false,
        message: "One of the fields is missing",
        data: null,
        errors: ["missing payload"]
      });
    }
    if (password !== confirmPassword) {
      return res.status(422).json({
        status: false,
        message: "Passwords do not match",
        data: null,
        error: "passwords mismatch"
      });
    }
    const hash = await hashPassword(password);
    const decodeUser = decodeToken(token);
    const updatePassword = await users.findOneAndUpdate(
      { _id: decodeUser.userId },
      { $set: { password: hash } }
    );

    if (!updatePassword) {
      return res.status(400).json({
        status: false,
        message: "oopss, something happened, your password recovery wasnt succesfull",
        data: null,
        error: "password recovery operation Failed"
      });
    }
    const data = {
      from: "noreply@emps.com",
      to: updatePassword.email,
      subject: "EMPS App Account Recovery",
      text: "Making Education easy",
      html: `
         <h1> EMPS Account recovery request </h1>
         Hello ${updatePassword.firstname}, <br/>
         <p> Your password has been reset successfully! </p>`
    };
    await mailgun.messages().send(data).catch((error) => res.status(400).json({
      status: false,
      message: "Sorry, an error occured - ",
      data: null,
      error
    }));
    return res.status(200).json({
      status: true,
      message: "Password reset was successful",
      data: null,
      error: null
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: null,
      error: [error]
    });
  }
};
