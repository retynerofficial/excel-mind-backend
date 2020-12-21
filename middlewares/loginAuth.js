/* eslint-disable consistent-return */
/* eslint-disable linebreak-style */

const User = require("../models/users");
const { decodeToken } = require("../helpers/authHelper");

const authMiddleWare = async (req, res, next) => {
  const stringToken = req.headers.authorization;
  if (!stringToken || !stringToken.startsWith("Bearer")) {
    return res
      .status(403)
      .json({ response: "A token is required in the header" });
  }
  const tokenArray = stringToken.split(" ");
  if (!tokenArray || tokenArray.length !== 2) return res.status(403).json({ response: "" });
  const token = tokenArray[1];
  try {
    const data = decodeToken(token);
    const user = await User.findById({ _id: data.userId });
    if (!user) {
      return res.status(401).json({
        response: "Authentcation failed"
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ response: "Opps!, your session expired, please login" });
    }
    return res.status(500).json({ response: error });
  }
};

module.exports = authMiddleWare;
