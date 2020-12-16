const express = require("express");
const {
  createClass, getOneVirtual, getAll, sendComment, comment, getComments, studentVirClasses
} = require("../controllers/virtualClass");
const authMiddleWare = require("../middlewares/loginAuth");

const router = express.Router();

router.get("/comment", comment);
router.get("/comments/:vclassid", getComments);
router.get("/student", authMiddleWare, studentVirClasses);

router.post("/create", authMiddleWare, createClass);
router.get("/", authMiddleWare, getAll);
router.get("/:id", authMiddleWare, getOneVirtual);
router.post("/comments/:vclassid", authMiddleWare, sendComment);

module.exports = router;
