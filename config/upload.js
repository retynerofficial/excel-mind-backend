const multer = require("multer");
const path = require("path");

function fileTypecheck(file, cb) {
  // accepted file extension
  const filetypes = /csv|ms-excel|xlsx/;

  // getting the file extension
  const extensionName = filetypes.test(path.extname(file.originalname).toLowerCase());

  // checking for the mimetype
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extensionName) {
    return cb(null, true);
  }
  return cb(new Error("Error Occured: The file type isnt allowed"));
}

const storage = multer.diskStorage({
  destination: "./public/questionbank",
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
//   fileFilter: (req, file, cb) => {
//     fileTypecheck(file, cb);
//   }
}).single("questionBank");

module.exports = upload;
