module.exports = {
  login,
  register,
  logout,
};

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
