const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/admin-auth.middleware");

const filmRoute = require("./film.route");

const accountController = require("../../controllers/admin/account.controller");

// AUTH
router.post("/login", accountController.login);

// MIDDLEWARE
router.use(authMiddleware.checkToken);
router.use(authMiddleware.requiredLogin);
router.all(authMiddleware.checkRole);

router.use("/film", filmRoute);

module.exports = router;
