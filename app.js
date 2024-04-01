const express = require("express");
const cors = require("cors");
const methodOverride = require("method-override");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
global.MOMENT = require("moment");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("./database/mongodb")();

const app = express();

const router = require("./routes");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use(methodOverride("_method"));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);

app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

module.exports = app;
