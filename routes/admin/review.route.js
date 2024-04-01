const express = require("express");
const router = express.Router();

const reviewController = require("../../controllers/admin/review.controller");

//REVIEW
router.get("/reviews", reviewController.getAll);
router.get("/reviews/:id", reviewController.getById);
router.put("/reviews/isHidden/:id", reviewController.updateHiddenStatus);
router.delete("/reviews/:id", reviewController.delete_);

module.exports = router;
