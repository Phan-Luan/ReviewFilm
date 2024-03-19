const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FilmSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    actor: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    premiere: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      select: false,
    },
    // updatedBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Account",
    //   select: false,
    // },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const Film = mongoose.model("Film", FilmSchema);

module.exports = Film;
