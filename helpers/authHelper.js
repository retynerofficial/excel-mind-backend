const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// gets the secret from env
// const { JWTSECRET } = process.env;

// hashpassword using the bcrypt package
const hashPassword = (plainPassword) => {
  // checks if there is password provided
  if (!plainPassword) {
    throw new Error("Error hashing password");
  }

  // salt round which bcrypt will use
  const salt = bcrypt.genSaltSync(10);

  // return the generated hashed string
  return bcrypt.hashSync(plainPassword, salt);
};

// function to check if the password matches with the hashed string in the db
const isPasswordValid = (hashedPass, plainPass) => bcrypt.compareSync(plainPass, hashedPass);

module.exports = { hashPassword, isPasswordValid };
