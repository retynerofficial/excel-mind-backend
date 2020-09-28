const express = require("express");
const User = require("../models/users");
const Resource = require("../models/resource");
const authMiddleWare = require("../middlewares/loginAuth");

const router = express.Router();

router.post("/upload/:classid", authMiddleWare, async (req, res) => {
  const upload = new Resource({
    uploader: req.user.id, classid: req.params.classid,
    resourceLink: req.body.resourceLink,
    resourceType: req.body.resourceType
  });

  try {
    await upload.save();
    res.send(upload);
  } catch (err) {
    res.status(500).send(err);
  }
});
module.exports = router;
