const jwt = require("jsonwebtoken");

const helper = {
  promisify,
  generateAdminAccountToken,
  generateToken,
  verifyToken,
  sendError,
  sendResponse,
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
        issuer: "reviewFilm",
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

function sendResponse(res, { data = null, error = null }) {
  if (data) return res.send({ status: 1, data, error: null });

  if (error) return res.send({ status: 0, data: null, error });

  return res.send({
    status: 0,
    data: null,
    error: { code: 500, msg: "Có lỗi xảy ra" },
  });
}

module.exports = helper;
