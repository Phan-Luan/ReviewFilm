const express = require("express");
const router = express.Router();

const upload = require("../../middlewares/upload.middleware");

const filmController = require("../../controllers/admin/film.controller");

//FILM
router.get("/films", filmController.getAll);
router.get("/films/:id", filmController.getById);
router.post("/films", upload.single("image"), filmController.create);
router.put("/films/:id", upload.single("image"), filmController.update);
router.delete("/films/:id", filmController.delete_);
router.put("/films/isHidden/:id", filmController.updateFilmIsHidden);
module.exports = router;
