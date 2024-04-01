const jwt = require("jsonwebtoken");
const { sendError } = require("../../libs/helpers");
const Account = require("../../models/account.model");

const SECRETSIGNATURE = process.env.ADMIN_ACCESS_TOKEN_SECRET;
const TOKENLIFE = process.env.ADMIN_ACCESS_TOKEN_LIFE;

module.exports = {
  login,
  create,
};

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const account = await Account.findOne({
      username,
      active: true,
      deleted: false,
    }).select("username name role password");
    if (account) {
      const isMatchPassword = account.comparePassword(password);
      if (!isMatchPassword)
        return sendError(res, 403, "Mật khẩu không không chính xác");
      const dataUser = {
        _id: account._id,
        username: account.username,
        name: account.name,
        role: account.role,
      };
      const accessToken = jwt.sign(dataUser, SECRETSIGNATURE, {
        expiresIn: TOKENLIFE,
      });
      res.cookie("jwt-admin", `Beaer ${accessToken}`);
      res.send({ accessToken, user: dataUser });
    } else {
      return sendError(res, 404, "Tài khoản không tồn tại");
    }
  } catch (err) {
    console.log("Error:account.admin.controller.login: ", err);
    return sendError(res);
  }
}

async function create(req, res, next) {
  try {
    const check_exists_email = await Account.findOne({
      email: req.body.email,
      deleted: false,
    });
    if (check_exists_email) return sendError(res, 409, "Email đã tồn tại");

    const account = await Account.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.send(account);
  } catch (err) {
    console.log("Error:account.admin.controller.create: ", err);
    return sendError(res);
  }
}
