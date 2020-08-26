/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
const jwt = require("jsonwebtoken");
const user = require("../models/users");
const { decodeToken } = require("../helpers/authHelper");

const authMiddleWare = async (req, res, next) => {
  try {
    const authorization = req.header("Authorization");
    if (!authorization) {
      return res.status(401).send({
        message: "Not logged in",
      });
    }
    const token = authorization.replace("Bearer ", "");
    const data = decodeToken(token);
    const users = await user.findById({ _id: data.userId });
    if (!users) {
      return res.status(401).send({
        message: "Not authorized to do this action",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: `${error}` });
  }
};
module.exports = authMiddleWare;
