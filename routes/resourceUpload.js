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

router.get("/uploads", async (req, res) => {
  const uploads = await Resource.find({});

  try {
    res.send(uploads);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/upload/:classid", async (req, res) => {
  const upload = await Resource.findOne(req.params.classid);

  try {
    res.send(upload);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/upload/:classid", async (req, res) => {
  try {
    const upload = await Resource.findByIdAndDelete(req.params.classid);

    if (!upload) res.status(404).send("No Resource found");
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
