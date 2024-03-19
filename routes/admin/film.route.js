const express = require("express");
const router = express.Router();

const uploadService = require("../../middlewares/upload-service.middleware");

const filmController = require("../../controllers/admin/film.controller");
const reviewController = require("../../controllers/admin/review.controller");

//FILM
router.get("/films", filmController.getAll);
router.get("/films/:id", filmController.getById);
router.post("/films", uploadService.single("image"), filmController.create);
router.put("/films/:id", uploadService.single("image"), filmController.update);
router.delete("/films/:id", filmController.delete_);

//REVIEW
router.get("/reviews", reviewController.getAll);
router.get("/reviews/:id", reviewController.getById);
router.put("/reviews/:id/hidden", reviewController.updateHiddenStatus);
router.delete("/reviews/:id", reviewController.delete_);

module.exports = router;
