const { sendError } = require("../../libs/helpers");

const User = require("../../models/user.model");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete_,
  updateActiveUser,
};

async function getAll(req, res, next) {
  try {
    const query = { deleted: false };
    const page = { current: 1, pageSize: 4 };
    if (req.query.page) {
      page.current = parseInt(req.query.page);
    }
    if (req.query.name) {
      query["$or"] = [
        { name: { $regex: new RegExp(req.query.name, "i") } },
        { slug: { $regex: new RegExp(req.query.name, "i") } },
      ];
    }
    const users = await User.find(query)
      .select("name email image active deleted")
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort({ createdAt: -1 });

    const totalUser = await User.countDocuments(query);
    page.totalPage = Math.ceil(totalUser / page.pageSize);
    res.render("admin/user", { users, page });
  } catch (err) {
    console.log("Error:account.admin.controller.getAll: ", err);
    return sendError(res);
  }
}

async function getById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "Tài khoản không tồn tại");
    res.send(user);
  } catch (err) {
    console.log("Error:user.admin.controller.getById: ", err);
    return sendError(res);
  }
}

async function create(req, res, next) {
  try {
    const data = req.body;
    const check_exists_email = await User.findOne({
      email: data.email,
      deleted: false,
    });
    if (check_exists_email) return sendError(res, 409, "Email đã tồn tại");
    if (req.file) data.image = req.file.filename;
    const user = await User.create(data);
    res.send({ user });
  } catch (err) {
    console.log("Error:user.admin.controller.create: ", err);
    return sendError(res);
  }
}

async function update(req, res, next) {
  try {
    const data = req.body;
    if (req.file) data.image = req.file.filename;
    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!user) return sendError(res, 404, "Tài khoản không tồn tại");

    res.send({ user });
  } catch (err) {
    console.log("Error:account.admin.controller.update: ", err);
    return sendError(res);
  }
}

async function delete_(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
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

async function updateActiveUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "Phim không tồn tại");
    if (user.active === false) {
      user.active = true;
    } else {
      user.active = false;
    }
    user.save();
    res.send({ success: true });
  } catch (err) {
    console.log("Error:admin.controller.updateActiveUser: ", err);
    return sendError(res);
  }
}
