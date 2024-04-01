const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const Schema = mongoose.Schema;

const ReplySchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
      default: "",
    },
    replyBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    review: {
      type: Schema.Types.ObjectId,
      ref: "Review",
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
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

ReplySchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

ReplySchema.plugin(mongooseLeanVirtuals);

const Reply = mongoose.model("Reply", ReplySchema);
module.exports = Reply;
