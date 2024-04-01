const jwt = require("jsonwebtoken");
const authMiddleware = {
  checkToken,
  checkLogin,
};

async function checkToken(req, res, next) {
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader) return res.sendStatus(401);
  const token = authorizationHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    req.user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}

async function checkLogin(req, res, next) {
  const token = req.cookies["jwt"];
  if (token) {
    req.user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
  next();
}

module.exports = authMiddleware;
