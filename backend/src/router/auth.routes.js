const { Router } = require("express");
const { registerController, loginController, logoutController } = require("../controllers/auth.controllers");

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/logout", logoutController);

module.exports = router;
