const router = require("express").Router();
const catchAsync = require("../utils/catchasync.js");
const oragniser = require("../controllers/organiserController.js");
const {authMiddleware, isOrganiser} = require("../middleware/auth.js");

router.route("/signup").post(catchAsync(oragniser.signup));

router.route("/login").post(catchAsync(oragniser.login));

router.route("/logout").get(catchAsync(oragniser.logout));

router.route("/create").post(authMiddleware, isOrganiser, catchAsync(oragniser.createTrip));

module.exports = router;
