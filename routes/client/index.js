const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/client-auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const clientController = require("../../controllers/client/index.controller");
const filmController = require("../../controllers/client/film.controller");
const reviewController = require("../../controllers/client/review.controller");

router.get("/login", clientController.login);
router.post("/login", clientController.postLogin);
router.get("/register", clientController.register);
router.post("/register", clientController.postRegister);
router.get("/logout", clientController.logout);

router.get("/", filmController.getAll);
router.get("/film/search", filmController.getAll);
router.get("/film/suggest", filmController.suggestFilm);
router.get("/film/:id", authMiddleware.checkLogin, filmController.getById);
router.get(
  "/reviews/:id",
  authMiddleware.checkLogin,
  filmController.getReviews
);

// MIDDLEWARE
router.use(authMiddleware.checkToken);

router.post("/review/like/:id", reviewController.likeReview);
router.post("/reply/like/:id", reviewController.likeReply);
router.post(
  "/film/review/:id",
  upload.single("image"),
  reviewController.create
);
router.post("/film/reply/:id", reviewController.replyReview);
module.exports = router;
