const { sendError, generateAdminAccountToken } = require("../../libs/helpers");

const Account = require("../../models/account.model");
const { ACCOUNT_DEFAULT_PASSWORD } = process.env.ACCOUNT_DEFAULT_PASSWORD;

module.exports = {
  login,
  getAll,
  getById,
  create,
  update,
  resetPassword,
  delete_,
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
      const accessToken = await generateAdminAccountToken({
        _id: account._id,
        username: account.username,
        name: account.name,
        role: account.role,
      });
      return res.send({ accessToken });
    } else {
      return sendError(res, 404, "Tài khoản không tồn tại");
    }
  } catch (err) {
    console.log("Error:account.admin.controller.login: ", err);
    return sendError(res);
  }
}

async function getAll(req, res, next) {
  try {
    const page = {
      current: 1,
      pageSize: 10,
    };
    const query = { deleted: false };
    if (req.query.current) {
      page.current = parseInt(req.query.current);
    }
    if (req.query.pageSize) {
      page.pageSize = parseInt(req.query.pageSize);
    }
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (req.query.name) {
      query["$or"] = [
        { name: { $regex: new RegExp(req.query.name, "i") } },
        { username: { $regex: new RegExp(req.query.name, "i") } },
      ];
    }
    const accounts = await Account.find(query)
      .select("-createdBy -updatedBy -updatedAt -__v")
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort({ createdAt: -1 });

    page.total = await Account.countDocuments(query);
    res.send({ data: accounts, meta: page });
  } catch (err) {
    console.log("Error:account.admin.controller.getAll: ", err);
    return sendError(res);
  }
}

async function getById(req, res, next) {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return sendError(res, 404, "Tài khoản không tồn tại");
    res.send(account);
  } catch (err) {
    console.log("Error:account.admin.controller.getById: ", err);
    return sendError(res);
  }
}

async function create(req, res, next) {
  try {
    if (req.body.name.trim() === "")
      return sendError(res, 422, "Tên không được để trống");
    if (req.body.password.trim() === "")
      return sendError(res, 422, "Mật khẩu không được để trống");
    if (req.body.password.trim().length < 6)
      return sendError(res, 422, "Mật khẩu phải có ít nhất 6 ký tự");
    if (req.body.password.trim().includes(" "))
      return sendError(res, 422, "Mật khẩu không được chứa dấu cách");
    if (req.body.username.trim().length < 3)
      return sendError(res, 422, "Tên tài khoản phải có ít nhất 3 ký tự");
    if (!/^[0-9a-zA-Z.]+$/.test(req.body.username.trim()))
      return sendError(res, 422, "Tên tài khoản phải có ít nhất 3 ký tự");

    const check_exists_username = await Account.findOne({
      username: req.body.username,
      deleted: false,
    });
    if (check_exists_username)
      return sendError(res, 409, "Tên tài khoản đã tồn tại");

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

async function update(req, res, next) {
  try {
    if (req.body.name.trim() === "")
      return sendError(res, 422, "Tên hiển thị không được để trống");
    if (req.body.name.trim().length < 3)
      return sendError(res, 422, "Tên hiển thị phải có ít nhất 3 ký tự");

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        // username: req.body.username,
        role: req.body.role,
        active: req.body.active,
        updatedBy: req.user._id,
      },
      { new: true }
    );

    if (!account) return sendError(res, 404, "Tài khoản không tồn tại");

    res.send(account);
  } catch (err) {
    console.log("Error:account.admin.controller.update: ", err);
    return sendError(res);
  }
}

async function resetPassword(req, res, next) {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return sendError(res, 404, "Tài khoản không tồn tại");

    account.password = ACCOUNT_DEFAULT_PASSWORD;
    await account.save();

    res.send({ success: true });
  } catch (err) {
    console.log("Error:account.admin.controller.resetPassword: ", err);
    return sendError(res);
  }
}

async function delete_(req, res, next) {
  try {
    const user = await Account.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!user) return sendError(res, 404, "Tài khoản không tồn tại");
    res.send({ success: true });
  } catch (err) {
    console.log("Error:account.admin.controller.delete_: ", err);
    return sendError(res);
  }
}
