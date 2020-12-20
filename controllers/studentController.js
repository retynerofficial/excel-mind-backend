const Student = require("../models/Student");
const Parent = require("../models/parent");
const Users = require("../models/users");
const Class = require("../models/class");
const ResourcePerson = require("../models/resourcePerson");
const { generateMailForInvite } = require("../services/email/mailhelper");
const mailingService = require("../services/email/mailingservice");

exports.inviteParent = async (req, res) => {
  const { email } = req.body;
  const { _id } = req.user;
  try {
    const student = await Student.findOne({ studentId: _id });
    const { studentKey } = student; // Find studentKey in Student collection
    const users = await Users.findOne({ _id });
    const name = `${users.firstname} ${users.lastname}`;
    const loginLink = "https://emps.netlify.app/users/login";
console.log(name);
    // send an invitation message to parent/gaurdian
    const options = {
      receiver: email,
      subject: "YOU ARE HAVE BEEN INVITED BY YOUR WARD",
      text: "WELCOME!!!",
      output: generateMailForInvite(loginLink, email, studentKey, name)
    };
    await mailingService(options);
    return res.status(200).json({ response: "Sucessfully sent" });
  } catch (error) {
    return res.status(400).json({ response: error });
  }
};

exports.joinClass = async (req, res) => {
  try {
    const { _id } = req.user;
    // receive class_id from url params
    const { classCode } = req.params;

    // Search if student is DB
    const User = await Users.findById({ _id });
    if (!User) {
      return res.status(404).json({ error: "Student not Logged In" });
    }
    if (User.role !== "student") {
      return res.status(404).json({ error: "only a student can join this class" });
    }
    // Store Student Info in Object
    const studentInfo = {
      firstname: User.firstname,
      lastname: User.lastname,
      UserId: User._id
    };

    // Add student to join class
    const updateClass = await Class.updateOne(
      { classCode }, { $addToSet: { student: studentInfo } }
    );

    if (!updateClass) res.status(400).json({ error: "student joined" });
    return res.status(200).json({ response: "Student sucessfully join" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.pickRP = async (req, res) => {
  try {
    const { _id } = req.user;
    const { userid } = req.params;
    // Search if student is DB
    const User = await Users.findById({ _id });
    if (!User) {
      return res.status(404).json({ error: "not Logged In" });
    }
    if (User.role !== "student") {
      return res.status(404).json({ error: "only a student can pick resource person" });
    }
    // Store Student Info in Object

    // check if the resourse person is fully booked
    const ResP = await ResourcePerson.findOne({ userid });

    if (ResP.studentList.length === 9) {
      const updateRes = await ResourcePerson.updateOne(
        { _id }, { listLength: true }
      );
      if (updateRes) return res.status(400).json({ response: "resource person is fully booked" });
    }

    // Add student to resource person list
    const addStudent = await ResourcePerson.findOneAndUpdate(
      { userid }, { $addToSet: { studentList: User } }
    );

    if (!addStudent) res.status(400).json({ error: "error picking resource person" });
    return res.json({ success: `you picked ${addStudent.userInfo.firstname} ${addStudent.userInfo.lastname}` });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.allStudent = async (req, res) => {
  try {
    const studentList = await Users.find({ role: "student" });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < await studentList.length) {
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
    results.results = await Users.find({ role: "student" }).limit(limit).skip(startIndex).exec();
    const paginatedResults = results;
    const totalPage = Math.round(studentList.length / limit)
    return res.status(200).json({ result: paginatedResults,totalPage });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
exports.searchStudent = async (req, res) => {
  try {
    const { name } = req.body;
    const values = name.split(" ");
    const fName = values[0];
    const lName = values[1] ? name.substr(name.indexOf(" ") + 1) : "";
    const studentSearch = await Users.find({
      role: "student",
      firstname: {
        $regex: fName, $options: "$i"
      },
      lastname: {
        $regex: lName, $options: "$i"
      }
    });
    return res.status(200).json({ result: studentSearch });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.eachStudent = async (req, res) => {
  try {
    const {
      userid
    } = req.params;

    //  Check id in DB to get the student user info to 
    const studentUserInfo = await Users.findOne({
      _id: userid
    });
    // check for student in parent collection with studentid
    const parentInfo = await Parent.findOne({
      "wards.userid": userid
    });
if(parentInfo == null || parentInfo.length <= 0 )  return res.status(200).json({  student: studentUserInfo, parent:"Student Is yet to invite parent"});
    
   //Check id in DB to get the student user info to 
      const parentUserInfo = await Users.findOne({
      _id: parentInfo.parentId
    });

    return res.status(200).json({student: studentUserInfo, parent:parentUserInfo
    });
  } catch (error) {
    return res.status(500).json({
      error
    });
  }
};

exports.studentCuriculum = async (req, res) => {
  try {
    // Get student user id 
    const userid = req.user._id;
    // find all course paid for and joined by the student
    const resp = await Class.find({"student.UserId": userid});
    let response = [];
    for (let i = 0; i < resp.length; i++) {
      const result = {
        course: resp[i].course,
        curriculum: resp[i].curriculum,
        material: resp[i].material,
        description: resp[i].description,
        picture: resp[i].pictureUrl
      }
      response.push(result)
    }
    // list the Curriculum out
    return res.status(200).json({ response });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.searchCuriculum = async (req, res) => {
  try {
    const { course } = req.body;
    const userid = req.user._id;
    // find all course paid for and joined by the student
    const curriculumSearch = await Class.find({ "student.UserId": userid, course
    });
    if (curriculumSearch.length < 1) return res.status(404).json({ result: `${course} is Not Found, Make Sure the class name is correct` });
    return res.status(200).json({ result: curriculumSearch });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
