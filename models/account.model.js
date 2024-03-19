const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const roles = ["super_admin", "admin", "customer_service"];

const AccountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      maxlength: 128,
      select: false,
    },
    role: {
      type: String,
      enum: roles,
      default: "account",
      lowercase: true,
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
  },
  { timestamps: true }
);

AccountSchema.pre("save", async function (next) {
  let account = this;
  // only hash the password if it has been modified (or is new)
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

AccountSchema.pre(
  ["findOneAndUpdate", "findByIdAndUpdate", "updateOne", "updateMany"],
  async function (next) {
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
  }
);

AccountSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

AccountSchema.index({ username: "text" });

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
