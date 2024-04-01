const path = require("path");
const Account = require("../models/account.model");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

(async () => {
  try {
    const rootAccount = {
      name: "Root",
      username: "root",
      password: process.env.ROOT_ACCOUNT_PASSWORD_DEFAULT,
      role: "super_admin",
      active: true,
    };
    await Account.findOneAndUpdate(
      { username: rootAccount.username },
      { ...rootAccount },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Init data success!");
  } catch (err) {
    console.log("Error:Init data error: ", err);
  }
})();
