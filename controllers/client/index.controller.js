const { sendError } = require("../../libs/helpers");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const SECRETSIGNATURE = process.env.ACCESS_TOKEN_SECRET;
const TOKENLIFE = process.env.ACCESS_TOKEN_LIFE;
module.exports = {
  login,
  postLogin,
  register,
  postRegister,
  logout,
};

function login(req, res, next) {
  try {
    res.render("login");
  } catch (error) {
    next(error);
  }
}

async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
      active: true,
      deleted: false,
    }).select("email name password");
    if (user) {
      const isMatchPassword = user.comparePassword(password);
      if (!isMatchPassword)
        return sendError(res, 403, "Mật khẩu không không chính xác");

      const accessToken = jwt.sign(
        { _id: user._id, email: user.email, name: user.name },
        SECRETSIGNATURE,
        {
          expiresIn: TOKENLIFE,
        }
      );

      res.send({ accessToken });
    } else {
      return sendError(res, 404, "Tài khoản không tồn tại");
    }
  } catch (err) {
    console.log("Error:index.controller.login: ", err);
    return sendError(res);
  }
}

function register(req, res, next) {
  try {
    res.render("register");
  } catch (error) {
    next(error);
  }
}

async function postRegister(req, res, next) {
  try {
    if (!req.body.email)
      return sendError(res, 409, "Email không được để trống");
    if (!req.body.password)
      return sendError(res, 409, "Mật khẩu không được để trống");
    if (!req.body.name) return sendError(res, 409, "Tên không được để trống");

    const check_exists_email = await User.findOne({
      email: req.body.email,
      deleted: false,
    });
    if (check_exists_email) return sendError(res, 409, "Email đã tồn tại");

    const user = await User.create(req.body);
    res.send(user);
  } catch (err) {
    console.log("Error:user.controller.create: ", err);
    return sendError(res);
  }
}

function logout(req, res, next) {
  try {
    res.clearCookie("jwt");
    res.redirect("/login");
  } catch (err) {
    console.log("user.controller.logout: ", err);
  }
}
