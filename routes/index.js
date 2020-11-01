const express = require("express");

const multer = require("multer");
const authMiddleWare = require("../middlewares/loginAuth");
const { upload, imageUpload } = require("../config/upload");

const {
  createTest,
  questionBank,
  pickTest,
  chooseTest
} = require("../controllers/testController");
const {
  createClass, allClass, oneClass, updateClass, deleteClass
} = require("../controllers/classController");

const { pickRP } = require("../controllers/studentController");
const { allRes } = require("../controllers/resourcePerson");
// const parser = require("../controllers/cloudinary");
const router = express.Router();

router.post("/test/questionbank", upload, questionBank);
router.get("/test/picktest", pickTest);
router.post("/test/:classId/create", multer().none(), chooseTest);
router.get("/test/:course", createTest);
router.post("/create/class", imageUpload, authMiddleWare, createClass);
router.post("/pick/resource_person/:userid", authMiddleWare, pickRP);
router.post("/update/class/:classCode", imageUpload, authMiddleWare, updateClass);
router.post("/delete/class/:classCode", authMiddleWare, deleteClass);
router.get("/course", allClass);
router.get("/resource", allRes);
router.get("/course/:classCode", oneClass);

module.exports = router;
