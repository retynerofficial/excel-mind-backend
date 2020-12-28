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
  createClass, allClass, oneClass, updateClass, deleteClass, classList, searchClass, joinedClass
} = require("../controllers/classController");


const { pickRP, allStudent, searchStudent, eachStudent, studentCuriculum, searchCuriculum } = require("../controllers/studentController");
const { allRes, resList,searchResource,eachResource,resStudent } = require("../controllers/resourcePerson");
// const parser = require("../controllers/cloudinary");
const router = express.Router();

// TODO : still needs an auth mid
router.post("/tests/:classId/questionbank", authMiddleWare, upload, questionBank);
// TODO : still needs an auth mid
router.get("/tests/picktest", authMiddleWare, pickTest);
// TODO : still needs an auth mid
router.post("/tests/:classId/create", authMiddleWare, multer().none(), chooseTest);
// TODO : still needs an auth mid
router.get("/tests/:course", createTest);
// TODO : still needs an auth mid
router.post("/create/class", authMiddleWare, imageUpload, createClass);
router.get("/joined/class", authMiddleWare, joinedClass);
router.post("/pick/resource_person/:userid", authMiddleWare, pickRP);
router.post("/update/class/:classCode", imageUpload, authMiddleWare, updateClass);
router.post("/delete/class/:classCode", authMiddleWare, deleteClass);
router.post("/student/search", authMiddleWare, searchStudent);
router.post("/student/curriculum/search", authMiddleWare, searchCuriculum);
router.get("/student/each/:userid", authMiddleWare, eachStudent);
router.get("/student/curriculum", authMiddleWare, studentCuriculum);
router.get("/course", authMiddleWare, allClass);
router.get("/resource", authMiddleWare, allRes);
router.get("/resource/search", authMiddleWare, searchResource);
router.get("/resource/list", authMiddleWare, resList);
router.get("/resource/student", authMiddleWare, resStudent);
router.get("/resource/each/:userid", authMiddleWare, eachResource);
router.get("/course/list", authMiddleWare, classList);
router.get("/course/search", authMiddleWare, searchClass);
router.get("/course/:classCode", authMiddleWare, oneClass);
router.get("/student", authMiddleWare, allStudent);

// get all the details about a test
router.get("/tests/payload/:classId", authMiddleWare, fullTest);
// get prep screen
router.get("/tests/prepScreen/:classId", authMiddleWare, testPrepScreen);
// get all the tests
router.get("/tests", authMiddleWare, gefinalTest);
// submit a question and score
router.post("/tests/submit/:testId/:questionId", authMiddleWare, submitQuestion);
router.post("/tests/submitPreview/:testId/:userId", authMiddleWare, submitPreview);
router.post("/tests/submitTest/:testId/:userId", authMiddleWare, submitTest);

module.exports = router;
