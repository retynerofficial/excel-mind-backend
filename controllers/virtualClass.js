/* eslint-disable no-underscore-dangle */
const moment = require("moment");
const Users = require("../models/users");
const virtualClass = require("../models/virtualClass");

exports.createClass = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const userRole = await Users.findById(loggedInUser);

    if ((userRole.role === "admin") || (userRole.role === "r.p")) {
      const {
        videoLink, className, description, tutor, date
      } = req.body;
      if (!videoLink || !className || !description || !date) {
        return res.status(400).json({
          response: "Please all fields are required"
        });
      }
      // TODO
      // check if it is the tutor that is signed or the tutor was assigned by another person(admin)
      const payload = {
        videoLink, className, description, date, tutor: loggedInUser

      };
      const savePayload = await virtualClass.create(payload);
      if (savePayload) {
        return res.status(200).json({ response: "operaion was succesfull", classDetails: savePayload });
      }
      return res.status(400).json({ response: "Oppsss!!, operation failed" });
    }
    return res.status(401).json({ response: "You are not autorised to perform this operation" });
  } catch (error) {
    return res.status(500).json({ response: `${error} occured` });
  }
};

exports.getOneVirtual = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const virClass = await virtualClass.findOne({ tutor: loggedInUser }).populate("tutor", "-password -__v -dateCreated");
    return res.status(200).json({
      response: {
        virtualClassId: virClass._id,
        video: virClass.videoLink,
        time: moment(virClass.date).format("HH:mm:ss"),
        date: moment(virClass.date).format("YYYY-MM-DD"),
        authorName: `${virClass.tutor.firstname} ${virClass.tutor.lastname}`,
        authorProfilePics: virClass.tutor.profile_picture,
        // TODO
        // put the correct baseurl, get it from the browser using req.hostname
        virtualClassLink: `https://www.${process.env.BASE_URL}/api/v1/virtuals/${virClass._id}`
      }
    });
  } catch (error) {
    return res.status(500).json({
      error
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const allVirClass = await virtualClass.find({ tutor: loggedInUser }).populate("tutor");
    return res.status(200).json({
      response: allVirClass.map((doc) => ({
        virtualClassId: doc._id,
        video: doc.videoLink,
        time: moment(doc.date).format("HH:mm:ss"),
        date: moment(doc.date).format("YYYY-MM-DD"),
        authorName: `${doc.tutor.firstname} ${doc.tutor.lastname}`,
        authorProfilePics: doc.tutor.profile_picture
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error
    });
  }
};
