const express = require("express");
const { createClass } = require("../controllers/virtualClass");
const authMiddleWare = require("../middlewares/loginAuth");

const router = express.Router();

router.post("/create", authMiddleWare, createClass);

module.exports = router;
