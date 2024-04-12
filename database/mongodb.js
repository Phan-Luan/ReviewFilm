const mongoose = require("mongoose");
const config = require("../config/database");
const ENV = process.env.NODE_ENV || "development";
const mongodb = config.mongodb[ENV];

module.exports = function () {
  mongoose.set("strictQuery", false);

  mongoose.connect(process.env.MONGODB_URL);

  mongoose.connection.on("connected", function () {
    console.log("Mongoose default was connected.");
    require("../libs/init-data");
  });

  mongoose.connection.on("error", function (err) {
    console.log("Mongoose default connection has occured error: ", err);
  });

  mongoose.connection.on("disconnected", function () {
    console.log("Mongoose default connection is disconnected");
  });

  process.on("SIGINT", function () {
    mongoose.connection.close(function () {
      process.exit(0);
    });
  });
};
