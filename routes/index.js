const express = require("express");

const multer = require("multer");
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
  // testRead
} = require("../controllers/testController");
const { createClass } = require("../controllers/classController");
const authMiddleWare = require("../middlewares/loginAuth");
// const parser = require("../controllers/cloudinary");
const router = express.Router();

// TODO : still needs an auth mid
router.post("/test/:classId/questionbank", upload, questionBank);
// TODO : still needs an auth mid
router.get("/test/picktest", pickTest);
// TODO : still needs an auth mid
router.post("/test/:classId/create", multer().none(), chooseTest);
// TODO : still needs an auth mid
router.get("/test/:course", createTest);
// TODO : still needs an auth mid
router.post("/create/class", imageUpload, authMiddleWare, createClass);

// get all the details about a test
router.get("/tests/payload/:classId", authMiddleWare, fullTest);
// get prep screen
router.get("/tests/:classId", authMiddleWare, testPrepScreen);
// get all the tests
router.get("/tests", authMiddleWare, gefinalTest);
// submit a question and score
router.post("/test/submit/:testId/:questionId", authMiddleWare, submitQuestion);

module.exports = router;
