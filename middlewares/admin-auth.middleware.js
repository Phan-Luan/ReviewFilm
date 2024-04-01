const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const adminAuthMiddleware = {
  checkToken,
  checkRole,
};
const roleAdmin = ["super_admin", "admin", "customer_service"];

async function checkToken(req, res, next) {
  const authorizationHeader =
    req.headers["authorization"] || req.cookies["jwt-admin"];
  if (!authorizationHeader) return res.redirect("admin/login");
  const token = authorizationHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    req.user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}

async function checkRole(req, res, next) {
  if (req.user) {
    if (roleAdmin.includes(req.user.role)) {
      next();
    } else {
      return next(createError(403, "Bạn không có quyền."));
    }
  } else {
    return next(createError(403, "Bạn phải đăng nhập để tiếp tục."));
  }
}

module.exports = adminAuthMiddleware;
