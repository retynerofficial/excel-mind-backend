const express = require("express");

const multer = require("multer");
const authMiddleWare = require("../middlewares/loginAuth");
const { upload, imageUpload } = require("../config/upload");

const {
  createTest,
  questionBank,
  pickTest,
  chooseTest,
  gefinalTest,
  testPrepScreen,
  fullTest,
  submitQuestion,
  submitTest,
  submitPreview
  // testRead
} = require("../controllers/testController");
const {
  createClass, allClass, oneClass, updateClass, deleteClass
} = require("../controllers/classController");

const { pickRP } = require("../controllers/studentController");
const { allRes } = require("../controllers/resourcePerson");
// const parser = require("../controllers/cloudinary");
const router = express.Router();

// TODO : still needs an auth mid
router.post("/tests/:classId/questionbank", upload, questionBank);
// TODO : still needs an auth mid
router.get("/tests/picktest", pickTest);
// TODO : still needs an auth mid
router.post("/tests/:classId/create", multer().none(), chooseTest);
// TODO : still needs an auth mid
router.get("/tests/:course", createTest);
// TODO : still needs an auth mid
router.post("/create/class", imageUpload, authMiddleWare, createClass);
router.post("/pick/resource_person/:userid", authMiddleWare, pickRP);
router.post("/update/class/:classCode", imageUpload, authMiddleWare, updateClass);
router.post("/delete/class/:classCode", authMiddleWare, deleteClass);
router.get("/course", allClass);
router.get("/resource", allRes);
router.get("/course/:classCode", oneClass);
// router.post("/update/class/:classCode", authMiddleWare, updateClass);
// router.post("/delete/class/:classCode", deleteClass);
// router.get("/course", authMiddleWare, allClass);
// router.get("/course/:classCode", authMiddleWare, oneClass);

// get all the details about a test
router.get("/tests/payload/:classId", authMiddleWare, fullTest);
// get prep screen
router.get("/tests/:classId", authMiddleWare, testPrepScreen);
// get all the tests
router.get("/tests", authMiddleWare, gefinalTest);
// submit a question and score
router.post("/tests/submit/:testId/:questionId", authMiddleWare, submitQuestion);
router.post("/tests/submitPreview/:testId/:userId", authMiddleWare, submitPreview);
router.post("/tests/submitTest/:testId/:userId", authMiddleWare, submitTest);

module.exports = router;
