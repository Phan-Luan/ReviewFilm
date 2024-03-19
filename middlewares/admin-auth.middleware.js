const createError = require("http-errors");
const { verifyToken } = require("../libs/helpers");
const Routes = require("../routes/admin");

const adminAuthMiddleware = {
  checkToken,
  requiredLogin,
  checkRole,
};

async function checkToken(req, res, next) {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    if (token) {
      if (token.startsWith("Token ")) {
        token = token.slice(6, token.length);
      }
      req.user = await verifyToken(
        token,
        process.env.ADMIN_ACCESS_TOKEN_SECRET
      );
    }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(createError(401, "Token hết hạn."));
    } else if (err.name === "JsonWebTokenError") {
      return next(createError(403, "Bạn phải đăng nhập lại để tiếp tục."));
    } else {
      return res.status(400).send();
    }
  }
}

async function requiredLogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    return next(createError(403, "Bạn phải đăng nhập để tiếp tục."));
  }
}

async function checkRole(req, res, next) {
  const router = Routes.find(
    (e) => e.path === req.route.path && e.method === req.method
  );
  if (!router || !router.roles.includes(req.user.role))
    return next(createError(403, "Bạn không có quyền."));
  next();
}

module.exports = adminAuthMiddleware;
