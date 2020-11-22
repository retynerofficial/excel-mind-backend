const Users = require("../models/users");
const virtualClass = require("../models/virtualClass");

exports.createClass = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const userRole = await Users.findById(loggedInUser);
    console.log(userRole.role);

    if ((userRole.role === "admin") || (userRole.role === "r.p")) {
      const {
        videoLink, className, description, tutor, date
      } = req.body;
      if (!videoLink || !className || !description || !date) {
        return res.status(400).json({
          response: "Please all fields are required"
        });
      }
      const payload = {
        videoLink, className, description, date, tutor: loggedInUser

      };
      const savePayload = virtualClass.create(payload);
      if (savePayload) {
        return res.status(200).json({ response: "operaion was succesfull" });
      }
      return res.status(400).json({ response: "Oppsss!!, operation failed" });
    }
    return res.status(401).json({ response: "You are not autorised to perform this operation" })
  } catch (error) {
    return res.status(500).json({ response: `${error} occured` });
  }
};
