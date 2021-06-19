const fs = require("fs");
const multer = require("multer");
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var dir = path.join(__dirname, "../uploads")

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    ["csv"].indexOf(
      file.originalname.split(".")[file.originalname.split(".").length - 1]
    ) === -1
  ) {
    cb({ message: "Invalid file type" }, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter
}).single("file");


const uploadCsv = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, async (err) => {
      if (err) {
        resolve(error);
      } else {
        resolve({ status: true, file: req.file });
      }
    });
  });
};

module.exports = { uploadCsv, upload };
