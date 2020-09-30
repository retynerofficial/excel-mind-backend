const express = require("express");
const {
  createTest,
  questionBank,
  pickTest,
  chooseTest
} = require("../controllers/testController");
const upload = require("../config/upload");

const router = express.Router();

router.get("/test/:course", createTest);
router.post("/test/questionbank", upload, questionBank);
router.get("/test/picktest", pickTest);
router.post("/test/create", chooseTest);

module.exports = router;
