const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const avatarDefault = "admin/avatar-default.jpg";
const slugName = require("mongoose-slug-updater");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    slugName: {
      type: String,
      slug: "name",
      unique: true,
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
    image: {
      type: String,
      default: avatarDefault,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
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
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
    image: this.image,
  };
};

UserSchema.index({ phone: "text" });
UserSchema.plugin(slugName);
UserSchema.plugin(mongooseLeanVirtuals);

const User = mongoose.model("User", UserSchema);
module.exports = User;
