const { sendError } = require("../../libs/helpers");
const Film = require("../../models/film.model");
const Review = require("../../models/review.model");
const Reply = require("../../models/reply.model");
module.exports = {
  getAll,
  getById,
  getReviews,
  suggestFilm,
};

function showError(fnc, res, err) {
  console.log(`Error:film.controller.${fnc}: `, err);
  return sendError(res);
}
async function suggestFilm(req, res, next) {
  try {
    const query = { deleted: false, isHidden: false };
    if (req.query.name) {
      query["$or"] = [
        { name: { $regex: new RegExp(req.query.name, "i") } },
        { slug: { $regex: new RegExp(req.query.name, "i") } },
      ];
    }
    const films = await Film.find(query)
      .select("name slug image avgStar")
      .limit(4)
      .sort({ avgStar: -1 });
    res.send({ success: true, films });
  } catch (error) {
    showError("suggestFilm", res, error);
  }
}

async function getAll(req, res, next) {
  try {
    const page = { current: 1, pageSize: 8 };
    const query = { deleted: false, isHidden: false };

    if (req.query.page) {
      page.current = parseInt(req.query.page);
    }
    if (req.query.name) {
      page.pageSize = 10;
      query["$or"] = [
        { name: { $regex: new RegExp(req.query.name, "i") } },
        { slug: { $regex: new RegExp(req.query.name, "i") } },
      ];
    }
    let sort = { avgStar: -1 };
    if (req.query.sort) {
      if (req.query.sort == "old") {
        sort = { createdAt: 1 };
      }
      if (req.query.sort == "good") {
        sort = { avgStar: -1 };
      }
      if (req.query.sort == "bad") {
        sort = { avgStar: 1 };
      }
      if (req.query.sort == "new") {
        sort = { createdAt: -1 };
      }
    }

    const films = await Film.find(query)
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort(sort);

    const reviewPromises = films.map(async (film) => {
      const reviews = await Review.find({
        film: film._id,
        deleted: false,
        isHidden: false,
      }).select("star");
      const totalReviews = reviews.length;
      return { film, totalReviews };
    });
    const newReviews = await Review.find()
      .populate("author", "name image")
      .populate("film", "id name slug")
      .sort({ createdAt: -1 })
      .limit(4);

    const filmWithReview = await Promise.all(reviewPromises);
    const totalFilm = await Film.countDocuments(query);
    page.totalPage = Math.ceil(totalFilm / page.pageSize);
    if (req.query.name || (req.query.name && req.query.current >= 1)) {
      res.render("search", { filmWithReview, page });
    } else {
      res.render("home", { filmWithReview, newReviews, page });
    }
  } catch (err) {
    showError("getAll", res, err);
  }
}

async function getById(req, res, next) {
  try {
    const film = await Film.findOne({ slug: req.params.id });
    if (!film) return sendError(res, 404, "Phim không tồn tại");

    const totalReviews = await Review.countDocuments({ film: film._id });
    const listFilmHot = await Film.find({
      deleted: false,
      isHidden: false,
    })
      .select("name slug image avgStar")
      .limit(4)
      .sort({ avgStar: -1 });
    res.render("detail-review", {
      film,
      totalReviews,
      listFilmHot,
    });
  } catch (err) {
    showError("getById", res, err);
  }
}

async function getReviews(req, res, next) {
  try {
    const page = { current: 1, pageSize: 4 };
    if (req.query.page) {
      page.current = parseInt(req.query.page);
    }
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      if (req.query.sort == "old") {
        sort = { createdAt: 1 };
      }
      if (req.query.sort == "good") {
        sort = { star: -1 };
      }
      if (req.query.sort == "bad") {
        sort = { star: 1 };
      }
    }
    let userId = 0;
    if (req.user) {
      userId = req.user._id;
    }
    const query = {
      film: req.params.id,
      isHidden: false,
      deleted: false,
    };
    const reviews = await Review.find(query)
      .populate("author", "name image")
      .populate("likes", "name")
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort(sort);

    const replyPromises = reviews.map(async (review) => {
      const replies = await Reply.find({ review: review._id })
        .populate("replyBy", "name image")
        .populate("likes", "name");
      return { review, replies };
    });

    const reviewsWithReplies = await Promise.all(replyPromises);
    const totalReview = await Review.countDocuments(query);
    page.totalPage = Math.ceil(totalReview / page.pageSize);
    res.send({
      success: true,
      reviews: reviewsWithReplies,
      userId,
      page,
      totalReview,
    });
  } catch (error) {
    showError("getReviews", res, error);
  }
}
