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
  submitQuestion
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

// fetches data for the test prep screen
// user have to be loggedin
router.get("/tests/payload/:classId", authMiddleWare, fullTest);
router.get("/tests/:classId", authMiddleWare, testPrepScreen);
router.get("/tests", gefinalTest);
router.post("/test/submit/:testId/:questionId", authMiddleWare, submitQuestion);
// royter.get("api/v1/course/:id", hghghghg);

module.exports = router;
