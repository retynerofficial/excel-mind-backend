const express = require("express");
const { signUp, login } = require("../controllers/userController");
const validator = require("../middlewares/validationmid");
const { userSchema, loginSchema } = require("../helpers/validationSchema");

const router = express.Router();

/* POST route for user to signup */
router.post("/signup", validator(userSchema), signUp);
router.post("/login", validator(loginSchema), login);
module.exports = router;
