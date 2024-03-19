const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const Image = require("./image.model");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      maxlength: 128,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  let account = this;
  if (!account.isModified("password") || account.password.length === 0) {
    return next();
  } else {
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(account.password, salt);
      account.password = hash;
      next();
    } catch (error) {
      console.log("Hash the password error: ", error);
      return next(error);
    }
  }
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const password = this.getUpdate().password;
  if (!password || password.length === 0) {
    return next();
  }
  try {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);
    this.getUpdate().password = hash;
    next();
  } catch (error) {
    console.log("Hash the password error: ", error);
    return next(error);
  }
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.getPublicFields = async function () {
  const avatar = await Image.findById(this._id).select("path").lean();
  return {
    _id: this._id,
    email: this.email,
    phone: this.phone,
    name: this.name,
    avatar: avatar,
  };
};

UserSchema.index({ phone: "text" });

UserSchema.plugin(mongooseLeanVirtuals);

const User = mongoose.model("User", UserSchema);
module.exports = User;
