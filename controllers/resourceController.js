const Class = require("../models/class");

exports.createClass = async (req, res) => {
  // User info from the JWT
  const { _id } = req.user;

  // Collecting the  class-name && picture-link from the body
  const { className, pictureUrl } = req.body;

  // Check if the user input name and picture
  if (!className || !pictureUrl) return res.status(403).json({ response: "one the fields is empty" });

  try {
    // Create and Save info in DB
    const createClass = await Class.create({
      className,
      pictureUrl,
      creatorId: _id
    });

    // check if the info was save succesfully to the DB
    if (!createClass) return res.status(405).json({ response: "Error creating new class" });
    return res.status(200).json({ response: "class created" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
