const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const Class = require("../models/class");
const Curriculum = require("../models/curriculum");
const Users = require("../models/users");
const resourcePerson = require("../models/resourcePerson");

exports.createClass = async (req, res) => {
  try { 
    // User info from the JWT
    const { _id } = req.user;

    // Collecting the  class-name  from the body
    const {
      className, description, price, duration, curriculum
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
git 
    // Get creator info from DB
    const creatorInfo = await Users.findById({ _id });
    const reInfo = await resourcePerson.findOne({ userId: _id });

    // Create and Save info in DB
    const createClass = await Class.create({
      className,
      description,
      price,
      duration,
      curriculum,
      course: reInfo.course,
      pictureUrl: imageUrl.url,
      creatorId: _id,
      creatorPics: creatorInfo.profile_picture
    });

    // Create and Save info in DB
    const createCurriculum = await Curriculum.create({
      curriculum, course: reInfo.course, classid: createClass._id
    });

    // check if the info was save succesfully to the DB
    if (!createClass) return res.status(405).json({ response: "Error creating new class" });
    return res.status(200).json({ response: createClass, createCurriculum });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.allClass = async (req, res) => {
  // Fetch all class
  const classList = await Class.find();
  classList.map((doc) => res.status(200).json({ doc }));
};

exports.oneClass = async (req, res) => {
  // Get ClassCode id from Params to get singular page
  const { classCode } = req.params;
  // Check id in DB to get the singular page
  const classList = await Class.findOne({ classCode });
  return res.status(200).json({ classList });
};
