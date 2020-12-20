const resourcePerson = require("../models/resourcePerson");
const Users = require("../models/users");

exports.resourceSpec = async (req, res) => {
  try {
    // User info from the JWT
    const { _id } = req.user;

    // Collecting the course-name  from the body
    const { course } = req.body;

    // Check if the user input course
    if (!course) return res.status(403).json({ response: "one the fields is empty" });

    const User = await Users.findById({ _id });

    const UserProfile = {
      firstname: User.firstname,
      lastname: User.lastname,
      profile_pics: User.profile_picture
    };
    // Create and Save info in DB
    const createCourse = await resourcePerson.create({
      course,
      userid: _id,
      userInfo: UserProfile
    });
    // check if the info was save succesfully to the DB
    if (!createCourse) return res.status(405).json({ response: "Error Choosing course" });
    return res.status(200).json({ response: createCourse });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.allRes = async (req, res) => {
  try {
    // Fetch all class
    const resourceList = await resourcePerson.find({ listLength: false });
    return res.status(200).json({ resourceList });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.resList = async (req, res) => {
  try {
    const resourceList = await Users.find({ role: "r.p" });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < await resourceList.length) {
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
    results.results = await Users.find({ role: "r.p" }).limit(limit).skip(startIndex).exec();
    const paginatedResults = results;
    return res.status(200).json({ result: paginatedResults });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.searchResource = async (req, res) => {
  try {
    const { name } = req.body;
    const values = name.split(" ");
    const fName = values[0];
    const lName = values[1] ? name.substr(name.indexOf(" ") + 1) : "";
    const resSearch = await Users.find({
      role: "r.p",
      firstname: {
        $regex: fName, $options: "$i"
      },
      lastname: {
        $regex: lName, $options: "$i"
      }
    });
    if (resSearch.length < 1) return res.status(404).json({result: `${fName} ${lName} is Not Found, Make Sure the name is correct`});
    return res.status(200).json({ result: resSearch });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.eachResource = async (req, res) => {
  try {
    const {
      userid
    } = req.params;
    consle.log(req.params)
    //  Check id in DB to get the resource user info to 
    const resourceUserInfo = await Users.findOne({
      _id: userid
    });
    consle.log(resourceUserInfo)
    const resourceCourse = await resourcePerson.findOne({userid});
        consle.log(resourceCourse)

    return res.status(200).json({resource: resourceUserInfo, course: resourceCourse.course });
  } catch (error) {
    return res.status(500).json({
      error
    });
  }
};
