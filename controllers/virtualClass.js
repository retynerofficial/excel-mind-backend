/* eslint-disable import/order */
/* eslint-disable no-underscore-dangle */
const moment = require("moment");
const app = require("../app");
// const { io } = require("../bin/www");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const Users = require("../models/users");
const virtualClass = require("../models/virtualClass");
const Comment = require("../models/comments");
const Class = require("../models/class");

// io.on('connection', () => {
//   console.log("new user joined the class");
// });

exports.createClass = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const userRole = await Users.findById(loggedInUser);

    if ((userRole.role === "admin") || (userRole.role === "r.p")) {
      const {
        videoLink, description, tutor, date, classId, topic
      } = req.body;
      if (!videoLink || !classId || !description || !date || !topic) {
        return res.status(400).json({
          response: "Please all fields are required"
        });
      }
      const candidates = await Class.findOne({ _id: classId });
      const students = candidates.student.map((doc) => ({ studentId: doc.UserId }));

      // TODO
      // check if it is the tutor that is signed or the tutor was assigned by another person(admin)
      const payload = {
        videoLink,
        description,
        date,
        tutor: !tutor ? loggedInUser : tutor,
        students,
        topic
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
        authorId: virClass.tutor._id,
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
        authorId: doc.tutor._id,
        authorName: `${doc.tutor.firstname} ${doc.tutor.lastname}`,
        authorProfilePics: doc.tutor.profile_picture,
        virtualClassLink: `https://www.${process.env.BASE_URL}/api/v1/virtuals/${doc._id}`

      }))
    });
  } catch (error) {
    return res.status(500).json({
      error
    });
  }
};

exports.sendComment = async (req, res) => {
  const loggedInUser = req.user._id || {};
  const { vclassid } = req.params;
  const { comment, commentType, user } = req.body;

  const payload = {
    virclassId: vclassid,
    commenter: loggedInUser || user,
    comment,
    commentType
  };

  const makeComment = await Comment.create(payload);
  if (makeComment) {
    io.emit("message", payload);
  }
  return res.status(200).json({ response: "comment sent" });
};

exports.comment = async (req, res) => {
  res.render("index");
};

exports.getComments = async (req, res) => {
  const payload = await Comment.find({ virclassId: "5fbcdb4b4fc8b1153f6f4c52" }).populate("commenter");
  return res.status(200).json({ response: payload });
};

exports.studentVirClasses = async (req, res) => {
  try {
    console.log(req.user);
    const studentId = req.user._id;
    // console.log("hi");
    const allVirClass = await virtualClass.find({
      students: { $all: [{ $elemMatch: { studentId } }] }
    });
    if (allVirClass.length < 1) return res.status(200).json({ response: "You do not have any pending virtual class pending" });
    return res.status(200).json({ allVirClass });
  } catch (error) {
    return res.status(500).json({ response: error });
  }
};
