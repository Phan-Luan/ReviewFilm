const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugName = require("mongoose-slug-updater");

const FilmSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
    },
    trailerId: {
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
      required: true,
      default: 0,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    actor: [
      {
        type: String,
        trim: true,
      },
    ],
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
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      select: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      select: false,
    },
    avgStar: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

FilmSchema.plugin(slugName);

const Film = mongoose.model("Film", FilmSchema);

module.exports = Film;
