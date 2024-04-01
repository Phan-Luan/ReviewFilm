const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/admin-auth.middleware");

const userRoute = require("./user.route");
const filmRoute = require("./film.route");
const reviewRoute = require("./review.route");

const accountController = require("../../controllers/admin/account.controller");
const adminController = require("../../controllers/admin/index.controller");

// AUTH
router.get("/login", adminController.login);
router.post("/login", accountController.login);
router.get("/register", adminController.register);
router.post("/register", accountController.create);

// MIDDLEWARE
router.use(authMiddleware.checkToken);
router.use(authMiddleware.checkRole);
router.get("/", (req, res, next) => {
  res.render("admin/home");
});
router.get("/logout", adminController.logout);

router.use("/film", filmRoute);
router.use("/user", userRoute);
router.use("/review", reviewRoute);

module.exports = router;
