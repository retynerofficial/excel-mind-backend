/* eslint-disable linebreak-style */
const express = require("express");
const {
  signUp, login, updateProfile, Profile, newsLetter, forgetPassword, recoverPassword

} = require("../controllers/userController");
const validator = require("../middlewares/validationmid");
const { userSchema, loginSchema, recoverSchema } = require("../helpers/validationSchema");
const authMiddleWare = require("../middlewares/loginAuth");
const { getEmail, joinClass } = require("../controllers/studentController");
const { addWard } = require("../controllers/parentController");
const { resourceSpec } = require("../controllers/resourcePerson");
const { imageUpload } = require("../config/upload");

const router = express.Router();

/* POST route for user to signup */
router.post("/signup", validator(userSchema), signUp);
router.post("/login", validator(loginSchema), login);
router.post("/student/invite", authMiddleWare, getEmail);
router.post("/parent/add", authMiddleWare, addWard);
router.post("/subscribe", newsLetter);
router.post("/update/profile", imageUpload, authMiddleWare, updateProfile);
router.post("/class/:classCode", authMiddleWare, joinClass);
router.post("/choose/course", authMiddleWare, resourceSpec);
router.get("/profile", authMiddleWare, Profile);
router.post("/forgot-password", validator(loginSchema), forgetPassword);
router.post("/recover", validator(recoverSchema), recoverPassword);

module.exports = router;
