const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

const cloudinarySetup = () => {
  cloudinary.config({
    cloud_name: "dmydsu4tc",
    api_key: 719141256462712,
    api_secret: "veCn6allacEwiiC69T3uRzyD7Lk"
  });
};

module.exports = cloudinarySetup;
