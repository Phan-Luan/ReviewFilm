const multer = require("multer");

const multerConfig = {
  storage: multer.memoryStorage(),
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
