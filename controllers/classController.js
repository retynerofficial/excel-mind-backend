const cloudinary = require("cloudinary").v2;
const Class = require("../models/class");

exports.createClass = async (req, res) => {
  try { // User info from the JWT
    const { _id } = req.user;
    // Collecting the  class-name  from the body
    const { className } = req.body;

    // Collecting the picture-link from req.files
    const { image } = req.files;
    if (!image) res.status(404).json({ error: "Image is not uploaded" });

    const imageUrl = await cloudinary.uploader.upload(
      image.tempFilePath,
      (error, result) => {
        if (error) res.status(400).json({ error });
        return result;
      }
    );

    // Check if the user input name and picture
    if (!className) return res.status(403).json({ response: "one the fields is empty" });

    // Create and Save info in DB
    const createClass = await Class.create({
      className,
      pictureUrl: imageUrl.url,
      creatorId: _id
    });

    // check if the info was save succesfully to the DB
    if (!createClass) return res.status(405).json({ response: "Error creating new class" });
    return res.status(200).json({ response: createClass });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
