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
    const page = {
      current: 1,
      pageSize: 10,
    };
    const query = { deleted: false, film: { $ne: null } };
    if (req.query.current) {
      page.current = parseInt(req.query.current);
    }
    if (req.query.pageSize) {
      page.pageSize = parseInt(req.query.pageSize);
    }
    if (req.query.name) {
      query.film = req.query.name;
    }
    if (req.query.star) {
      query.star = req.query.star;
    }

    const reviews = await Review.find(query)
      .populate("image", ["path"])
      .populate("film", "name")
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort({ updatedAt: -1 })
      .lean({ virtuals: false });

    page.total = await Review.countDocuments(query);

    res.send({ data: reviews, meta: page });
  } catch (err) {
    console.log("Error:review.admin.controller.getAll: ", err);
    return sendError(res);
  }
}

async function getById(req, res, next) {}

async function delete_(req, res, next) {}

async function updateHiddenStatus(req, res, next) {}
