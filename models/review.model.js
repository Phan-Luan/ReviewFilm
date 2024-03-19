const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    star: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
    },
    film: {
      type: Schema.Types.ObjectId,
      ref: "Film",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isHidden: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

ReviewSchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

ReviewSchema.plugin(mongooseLeanVirtuals);

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
