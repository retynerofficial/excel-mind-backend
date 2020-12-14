/* eslint-disable no-underscore-dangle */
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const ResourcePerson = require("../models/resourcePerson");

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
      return res.status(404).json({ error: "only a resource person and admin can create this class" });
    }
    // Collecting the  info  from the body
    const {
    description, price, duration, curriculum, material, course
    } = req.body;

    // Check if the user input name and picture
    if (!description || !price || !duration || !curriculum || !material || !course) return res.status(403).json({ response: "one the fields is empty" });

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

    // Create and Save info in DB
    const createClass = await Class.create({
      course,
      description,
      price,
      curriculum,
      duration,
      pictureUrl: imageUrl.url,
      creatorId: _id,
      creatorPics: creatorInfo.profile_picture
    });
    
    console.log(createClass)

    // Create curriculum and Save info in DB
    await Curriculum.create({
      curriculum, course, classid: createClass._id, creatorId: _id
    });
    // Create Material and Save info in DB
    await Materials.create({
      material, classid: createClass._id, creatorId: _id
    });

    // check if the info was save succesfully to the DB
    if (!createClass) return res.status(405).json({ response: "Error creating new class" });
    return res.status(200).json({ response: createClass });
  } catch (error) {
    console.log(error)
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
    course, description, price, duration, curriculum, material
    } = req.body;

    // Check if the user input name and picture
    if (!description || !price || !duration || !curriculum || !material || !course) return res.status(403).json({ response: "one the fields is empty" });

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
      course, description, price, duration, curriculum, material
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
    if (deleteClass) return res.status(200).json({ sucess: "Deleted" });
  } catch (error) {
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
    // userid
    const userid = req.user._id
  // Get ClassCode id from Params to get singular page
    const { classCode } = req.params;
    // Check id in DB to get the singular Info of class
    const classInfo = await Class.findOne({ classCode });
    // first find if the logged in users pick this resource person earlier
    const classResourceperson = await ResourcePerson.find({ course: classInfo.course, "studentList._id": userid }); 
    // get info of the resource person for each class
    const classResepersonList = await ResourcePerson.find({ course: classInfo.course});
    /*  after searching if the logged in user in resourcperson student list is false 
    display list of all available resource person , if it found display the info of 
    the resourceperson*/

    if(classResourceperson.length === 0) {
      return res.status(404).json({ classInfo, classResepersonList})
     }else if(classResourceperson ) {
       return res.status(200).json({ sucess: `student already picked a resource person for this course`, classInfo,
       resourcePersoninfo: classResourceperson
      })}
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.classList = async (req, res) => {
  try {
    const classList = await Class.find();
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < classList.length) {
      results.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit
      };
    }
    results.results = await Class.find().limit(limit).skip(startIndex).exec();
    const paginatedResults = results;

    // console.log(res.paginatedResults);
    return res.status(200).json({ result: paginatedResults });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.searchClass = async (req, res) => {
  try {
    const { name } = req.body;
    const classSearch = await Class.find({
      className: {
        $regex: name, $options: "$i"
      }
    });
    if (classSearch.length < 1) return res.status(404).json({ result: `${name} is Not Found, Make Sure the class name is correct` });
    return res.status(200).json({ result: classSearch });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.joinedClass = async (req, res) => {
  try {
    // Get student user id 
    const userid = req.user._id;
    // find all course paid for and joined by the student
    const classList = await Class.find({"student.UserId": userid});
    // list thse course
    return res.status(200).json({ result: classList });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
