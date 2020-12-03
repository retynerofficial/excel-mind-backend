/* eslint-disable linebreak-style */
const express = require("express");
const {
  signUp, login, updateProfile, Profile, newsLetter, testRead

} = require("../controllers/userController");
const validator = require("../middlewares/validationmid");
const { userSchema } = require("../helpers/validationSchema");
const authMiddleWare = require("../middlewares/loginAuth");
const { getEmail, joinClass} = require("../controllers/studentController");
const { addWard } = require("../controllers/parentController");
const { resourceSpec } = require("../controllers/resourcePerson");
const { imageUpload } = require("../config/upload");

const router = express.Router();

/* POST route for user to signup */
router.post("/signup", validator(userSchema), signUp);
router.post("/login", login);
router.post("/student/invite", authMiddleWare, getEmail);
router.post("/parent/add", authMiddleWare, addWard);
router.post("/subscribe", newsLetter);
router.post("/update/profile", imageUpload, authMiddleWare, updateProfile);
router.post("/class/:classCode", authMiddleWare, joinClass);
router.get("/Realtime", testRead);
router.post("/choose/course", authMiddleWare, resourceSpec);
router.get("/profile", authMiddleWare, Profile);

module.exports = router;
