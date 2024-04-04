const { startSession } = require("mongoose");

const { sendError, getSlug } = require("../../libs/helpers");

const Review = require("../../models/review.model");

module.exports = {
  getAll,
  getById,
  delete_,
  updateHiddenStatus,
};

async function getAll(req, res, next) {
  try {
    const query = { deleted: false };
    const page = { current: 1, pageSize: 4 };
    if (req.query.page) {
      page.current = parseInt(req.query.page);
    }
    if (req.query.name) {
      query.slugFilmName = { $regex: new RegExp(req.query.name, "i") };
    }
    const reviews = await Review.find(query)
      .populate("film", "name")
      .populate("author", "name")
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    const totalReview = await Review.countDocuments(query);
    page.totalPage = Math.ceil(totalReview / page.pageSize);

    res.render("admin/review", { reviews, page });
  } catch (err) {
    console.log("Error:review.admin.controller.getAll: ", err);
    return sendError(res);
  }
}

async function getById(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate(
      "film",
      "name"
    );
    if (!review) return sendError(res, 404, "Đánh giá không tồn tại");
    res.send(review);
  } catch (err) {
    console.log("Error:review.admin.controller.getById: ", err);
    return sendError(res);
  }
}

async function delete_(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!review) return sendError(res, 404, "Đánh giá không tồn tại");
    res.send({ success: true });
  } catch (err) {
    console.log("Error:review.admin.controller.delete_: ", err);
    return sendError(res);
  }
}

async function updateHiddenStatus(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 404, "Đánh giá không tồn tại");
    if (review.isHidden === false) {
      review.isHidden = true;
    } else {
      review.isHidden = false;
    }
    review.save();
    res.send({ success: true });
  } catch (err) {
    console.log("Error:review.admin.controller.updateHiddenStatus: ", err);
    return sendError(res);
  }
}
