const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const Account = require("../models/account.model");
const User = require("../models/user.model");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

(async () => {
  try {
    await createUploadDirectory();

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

    const testUser = {
      phone: "0968768464",
      email: "luanpv2003gmail.com",
      name: "Phan Luan",
      password: process.env.TEST_USER_PASSWORD_DEFAULT,
      active: true,
    };
    await User.findOneAndUpdate(
      { phone: testUser.phone },
      { ...testUser },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Init data success!");
  } catch (err) {
    console.log("Error:Init data error: ", err);
  }
})();

async function createUploadDirectory() {
  const directory = path.join(__dirname, "../uploads/images");
  try {
    // Kiểm tra xem thư mục có tồn tại không
    await fsp.access(directory);
  } catch (err) {
    // Nếu thư mục không tồn tại, tạo mới
    try {
      await fsp.mkdir(directory, { recursive: true });
      console.log(`Thư mục uploads đã được tạo.`);
    } catch (err) {
      console.error("Không thể tạo thư mục:", err);
    }
  }
}
