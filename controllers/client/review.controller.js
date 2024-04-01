const { sendError } = require("../../libs/helpers");

const Review = require("../../models/review.model");
const Reply = require("../../models/reply.model");
const Film = require("../../models/film.model");
module.exports = {
  create,
  replyReview,
  likeReview,
  likeReply,
};
function showError(fnc, res, err) {
  console.log(`Error:film.admin.controller.${fnc}: `, err);
  return sendError(res);
}

async function create(req, res, next) {
  try {
    const data = req.body;
    if (req.file) data.image = req.file.filename;
    data.author = req.user._id;
    const newReview = await Review.create(data);
    if (newReview) {
      const totalReviews = await Review.countDocuments({
        film: data.film,
        deleted: false,
        isHidden: false,
      });

      const reviews = await Review.find({
        film: data.film,
        deleted: false,
        isHidden: false,
      }).select("star");

      let totalStar = 0;
      reviews.forEach((review) => {
        totalStar += review.star;
      });

      const avg = (totalStar / totalReviews).toFixed(1);

      const film = await Film.findById(data.film);
      film.avgStar = avg;
      await film.save();
    }
    const review = await Review.findById(newReview._id)
      .populate("author", "name image")
      .populate("likes", "name")
      .sort({ createdAt: -1 });
    res.send(review);
  } catch (err) {
    showError("create", res, err);
  }
}

async function replyReview(req, res, next) {
  try {
    const data = req.body;
    data.replyBy = req.user._id;
    const newReply = await Reply.create(data);
    const reply = await Reply.findById(newReply._id)
      .populate("replyBy", "name image")
      .populate("likes", "name");
    res.send(reply);
  } catch (error) {
    showError("create", res, error);
  }
}

async function likeReview(req, res, next) {
  try {
    const userId = req.user._id;
    if (!userId) return sendError(res, 401, "Vui lòng đăng nhập");
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    const likes = review.likes;
    let isLike = likes.includes(userId);
    if (isLike) {
      review.likes = likes.filter(
        (like) => like.toString() !== userId.toString()
      );
    } else {
      review.likes.push(userId);
    }

    await review.save();
    res.send({ isLike });
  } catch (error) {
    showError("likeReview", res, error);
  }
}

async function likeReply(req, res, next) {
  try {
    const userId = req.user._id;
    const replyId = req.params.id;
    const reply = await Reply.findById(replyId);
    const likes = reply.likes;
    const isLike = likes.includes(userId);
    if (isLike) {
      reply.likes = likes.filter(
        (like) => like.toString() !== userId.toString()
      );
    } else {
      reply.likes.push(userId);
    }

    await reply.save();
    res.send({ isLike });
  } catch (error) {
    showError("likeReview", res, error);
  }
}
