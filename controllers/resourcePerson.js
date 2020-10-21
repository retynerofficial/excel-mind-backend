const resourcePerson = require("../models/resourcePerson");

exports.resourceSpec = async (req, res) => {
  try {
    // User info from the JWT
    const { _id } = req.user;

    // Collecting the  course-name  from the body
    const { course } = req.body;

    // Check if the user input course
    if (!course) return res.status(403).json({ response: "one the fields is empty" });

    // Create and Save info in DB
    const createCourse = await resourcePerson.create({
      course,
      userId: _id
    });
    // check if the info was save succesfully to the DB
    if (!createCourse) return res.status(405).json({ response: "Error Choosing course" });
    return res.status(200).json({ response: createCourse });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
