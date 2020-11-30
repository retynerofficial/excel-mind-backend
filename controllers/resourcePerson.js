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
