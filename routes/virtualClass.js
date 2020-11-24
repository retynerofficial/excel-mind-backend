const express = require("express");
const { createClass, getOneVirtual, getAll } = require("../controllers/virtualClass");
const authMiddleWare = require("../middlewares/loginAuth");

const router = express.Router();

router.post("/create", authMiddleWare, createClass);
router.get("/", authMiddleWare, getAll);
router.get("/:id", authMiddleWare, getOneVirtual);

module.exports = router;
