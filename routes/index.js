const express = require("express");
const router = express.Router();
const adminAPI = require("./admin");

router.use("/api/v1", adminAPI);

module.exports = router;
