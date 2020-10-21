const Student = require("../models/Student");
const Admin = require("../models/admin");
const Parent = require("../models/parent");
const Resource = require("../models/resourcePerson");

const checkRole = async (Users) => {
  // eslint-disable-next-line no-underscore-dangle
  const uniqueId = Users._id;
  if (Users.role === "student") {
    const student = await Student({ studentId: uniqueId });
    student.save();
  } else if (Users.role === "r.p") {
    const resource = await Resource({ resourceId: uniqueId });
    resource.save();
  } else if (Users.role === "parent") {
    const parent = await Parent({ parentId: uniqueId });
    parent.save();
  } else if (Users.role === "admin") {
    const admin = await Admin({ adminId: uniqueId });
    admin.save();
  }
};

module.exports = checkRole;
