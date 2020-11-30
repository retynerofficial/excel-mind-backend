const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const Class = require("../models/class");
const Curriculum = require("../models/curriculum");
const Users = require("../models/users");
const resourcePerson = require("../models/resourcePerson");
const Materials = require("../models/material");

exports.createClass = async (req, res) => {
  try {
    // User info from the JWT
    const { _id } = req.user;
    const creatorInfo = await Users.findById({ _id });
    if (creatorInfo.role !== "r.p") {
      return res.status(404).json({ error: "only a resource person can join this class" });
    }
    // Collecting the  class-name  from the body
    const {
      className, description, price, duration, curriculum, material
    } = req.body;

    // Check if the user input name and picture
    if (!className) return res.status(403).json({ response: "one the fields is empty" });

    // Collecting the picture-link from req.files
    const image = req.file.path;
    if (!image) return res.status(404).json({ error: "Image is not uploaded" });

    // Saving image to cloudinary and getting back the URL
    const imageUrl = await cloudinary.uploader.upload(
      image,
      (error, result) => {
        if (error) return res.status(400).json({ error });
        return result;
      }
    );

    if (imageUrl) fs.unlinkSync(image);

    // Get creator info from DB
    const reInfo = await resourcePerson.findOne({ userId: _id });

    // Create and Save info in DB
    const createClass = await Class.create({
      className,
      description,
      price,
      curriculum,
      duration,
      course: reInfo.course,
      pictureUrl: imageUrl.url,
      creatorId: _id,
      creatorPics: creatorInfo.profile_picture
    });

    // Create curriculum and Save info in DB
    await Curriculum.create({
      curriculum, course: reInfo.course, classid: createClass._id, creatorId: _id
    });
    // Create Material and Save info in DB
    await Materials.create({
      material, classid: createClass._id, creatorId: _id
    });

    // check if the info was save succesfully to the DB
    if (!createClass) return res.status(405).json({ response: "Error creating new class" });
    return res.status(200).json({ response: createClass });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

exports.updateClass = async (req, res) => {
  try {
    // User info from the JWT
    const { _id } = req.user;

    // Params Info
    const { classCode } = req.params;

    // Collecting the  class-name  from the body
    const {
      className, description, price, duration, curriculum, material
    } = req.body;

    // Check if the user input name and picture
    if (!className) return res.status(403).json({ response: "one the fields is empty" });

    // Collecting the picture-link from req.files
    const image = req.file.path;
    if (!image) return res.status(404).json({ error: "Image is not uploaded" });

    // Saving image to cloudinary and getting back the URL
    const imageUrl = await cloudinary.uploader.upload(
      image,
      (error, result) => {
        if (error) return res.status(400).json({ error });
        return result;
      }
    );

    if (imageUrl) fs.unlinkSync(image);
    const updateClass = await Class.updateOne({ classCode }, {
      className, description, price, duration, curriculum, material
    });
    // check if the info was save succesfully to the DB
    if (!updateClass) return res.status(405).json({ response: "Error updating class" });
    return res.status(200).json({ sucess: "Sucessfully Updated" });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ error });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    // Params Info
    const { classCode } = req.params;

    const deleteClass = await Class.deleteOne({ classCode });

    return res.status(200).json({ sucess: "Deleted" });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ error });
  }
};

exports.allClass = async (req, res) => {
  try {
    // Fetch all class
    const classList = await Class.find();
    return res.status(200).json({ classList });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.oneClass = async (req, res) => {
  try {
  // Get ClassCode id from Params to get singular page
    const { classCode } = req.params;
    // Check id in DB to get the singular page
    const classList = await Class.findOne({ classCode });
    return res.status(200).json({ classList });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
