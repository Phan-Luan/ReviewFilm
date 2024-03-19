const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });
require("./database/mongodb")();

const app = express();

const router = require("./routes");

app.use(morgan("dev", { skip: (req, res) => req.method === "OPTIONS" }));
app.use(helmet({ noSniff: false, crossOriginResourcePolicy: false }));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);

// catch 404 and forwarding to error handle
app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
      // message: process.env.NODE_ENV === "production" ? 'Có lỗi xảy ra' : err.message
    },
  });
});

module.exports = app;
