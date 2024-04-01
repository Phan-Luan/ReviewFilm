const express = require("express");
const router = express.Router();
const adminAPI = require("./admin");
const clientAPI = require("./client");

router.use("/admin", adminAPI);
router.use("/", clientAPI);

module.exports = router;
