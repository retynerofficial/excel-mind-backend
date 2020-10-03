const express = require("express");
const { createTest, questionBank, pickTest } = require("../controllers/testController");
const upload = require("../config/upload");
const { createClass } = require("../controllers/classController");
const authMiddleWare = require("../middlewares/loginAuth");
// const parser = require("../controllers/cloudinary");

const router = express.Router();

router.get("/test", createTest);
router.post("/test/questionbank", upload, questionBank);
router.get("/createTest", pickTest);
router.post("/create/class", authMiddleWare, createClass);

module.exports = router;
