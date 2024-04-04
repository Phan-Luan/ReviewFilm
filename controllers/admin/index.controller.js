const { sendError } = require("../../libs/helpers");

const Film = require("../../models/film.model");

module.exports = {
  index,
  login,
  register,
  logout,
};

function showError(fnc, res, err) {
  console.log(`Error:film.admin.controller.${fnc}: `, err);
  return sendError(res);
}

async function index(req, res, next) {
  try {
    const Top4Film = await Film.find({
      deleted: false,
      isHidden: false,
      avgStar: { $gt: 0 },
    })
      .limit(4)
      .sort({
        avgStar: -1,
      });
    res.render("admin/home", { films: Top4Film });
  } catch (error) {
    showError("controller.admin.index", res, error);
  }
}

function login(req, res) {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log("admin.index.controller.logout: ", error);
  }
}

function register(req, res, next) {
  try {
    res.render("admin/register");
  } catch (error) {
    console.log("admin.register.controller.logout: ", error);
  }
}

function logout(req, res, next) {
  try {
    res.redirect("/admin/login");
  } catch (error) {
    console.log("admin.logout.controller.logout: ", error);
  }
}
