/* eslint-disable linebreak-style */
const express = require("express");
const {
  signUp, login, addProfilePics
} = require("../controllers/userController");
const validator = require("../middlewares/validationmid");
const { userSchema, loginSchema } = require("../helpers/validationSchema");
const authMiddleWare = require("../middlewares/loginAuth");
const { getEmail, joinClass } = require("../controllers/studentController");
const { addWard } = require("../controllers/parentController");
const { imageUpload } = require("../config/upload");

const router = express.Router();

/* POST route for user to signup */
router.post("/signup", validator(userSchema), signUp);
router.post("/login", validator(loginSchema), login);
router.post("/student/invite", authMiddleWare, getEmail);
router.post("/parent/add", authMiddleWare, addWard);
router.post("/upload/picture", imageUpload, authMiddleWare, addProfilePics);
router.post("/class/:classCode", authMiddleWare, joinClass);

module.exports = router;
