const express = require("express");
const { createTest, questionBank, pickTest } = require("../controllers/testController");
const upload = require("../config/upload");


const router = express.Router();

router.get("/test", createTest);
router.post("/test/questionbank", upload, questionBank);
router.get("/createTest", pickTest);

module.exports = router;
