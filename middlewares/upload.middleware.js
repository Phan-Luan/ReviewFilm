const path = require("path");
const multer = require("multer");

const multerConfig = {
  storage: multer.diskStorage({
    destination: async (req, file, next) => {
      try {
        next(null, "./public/assets/images");
      } catch (err) {
        console.log({ function: `multerConfig.storage`, message: err });
        next();
      }
    },
    filename: async (req, file, next) => {
      const ext = file.originalname.split(".")[1];
      next(
        null,
        file.originalname.split(".")[0] + "-" + Date.now() + "." + ext
      );
    },
  }),
  fileFilter: (req, file, next) => {
    if (!file) {
      next();
    } else if (!file.mimetype.startsWith("image")) {
      next();
    }
    next(null, true);
  },
};

module.exports = multer(multerConfig);
