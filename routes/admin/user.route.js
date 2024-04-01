const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.middleware");
const userController = require("../../controllers/admin/user.controller");

router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.post("/users", upload.single("image"), userController.create);
router.put("/users/:id", upload.single("image"), userController.update);
router.put("/users/active/:id", userController.updateActiveUser);
router.delete("/users/:id", userController.delete_);
module.exports = router;
