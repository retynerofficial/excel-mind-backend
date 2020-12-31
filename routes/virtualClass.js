const express = require("express");
const {
  createClass, getOneVirtual, getAll, sendComment, comment, getComments, studentVirClasses
} = require("../controllers/virtualClass");
const authMiddleWare = require("../middlewares/loginAuth");
const validateSubscription = require("../middlewares/validateSubscription");

const router = express.Router();

router.get("/comment", authMiddleWare, validateSubscription, comment);
router.get("/comments/:vclassid", authMiddleWare, validateSubscription, getComments);
router.get("/student", authMiddleWare, validateSubscription, studentVirClasses);

router.post("/create", authMiddleWare, validateSubscription, createClass);
router.get("/", authMiddleWare, validateSubscription, getAll);
router.get("/:id", authMiddleWare, validateSubscription, getOneVirtual);
router.post("/comments/:vclassid", authMiddleWare, validateSubscription, sendComment);

module.exports = router;
