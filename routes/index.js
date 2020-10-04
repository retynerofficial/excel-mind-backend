const express = require("express");
const multer = require("multer");

const {
  createTest,
  questionBank,
  pickTest,
  chooseTest
} = require("../controllers/testController");
const upload = require("../config/upload");

const router = express.Router();

router.post("/test/questionbank", upload, questionBank);
router.get("/test/picktest", pickTest);
router.post("/test/create", multer().none(), chooseTest);
router.get("/test/:course", createTest);

module.exports = router;
