const jwt = require("jsonwebtoken");

const helper = {
  promisify,
  generateAdminAccountToken,
  generateToken,
  verifyToken,
  sendError,
  sendResponse,
  getSlug,
};

function promisify(inner) {
  return new Promise((resolve, reject) => {
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function generateToken(user, secretSignature, tokenLife) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { ...user },
      secretSignature,
      {
        issuer: "goka.app",
        algorithm: "HS256",
        expiresIn: tokenLife,
      },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        resolve(token);
      }
    );
  });
}

function verifyToken(token, secretKey) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
}

async function generateAdminAccountToken(account) {
  return await generateToken(
    account,
    process.env.ADMIN_ACCESS_TOKEN_SECRET,
    process.env.ADMIN_ACCESS_TOKEN_LIFE
  );
}

function sendError(res, code = 500, msg = "Có lỗi xảy ra") {
  return sendResponse(res, { error: { code, msg } });
}

function sendResponse(res, { data = null, paging = null, error = null }) {
  if (data) return res.send({ status: 1, data, paging, error: null });

  if (error) return res.send({ status: 0, data: null, paging: null, error });

  return res.send({
    status: 0,
    data: null,
    paging: null,
    error: { code: 500, msg: "Có lỗi xảy ra" },
  });
}

function getSlug(str) {
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
  str = str.replace(/(đ)/g, "d");
  str = str.replace(/([^0-9a-z-\s])/g, "");
  str = str.replace(/- /g, "");
  str = str.replace(/(\s+)/g, "-");
  str = str.replace(/^-+/g, "");
  str = str.replace(/-+$/g, "");
  return str;
}

module.exports = helper;
