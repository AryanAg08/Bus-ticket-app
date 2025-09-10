const router = require("express").Router();
const catchAsync = require("../utils/catchasync");
const user = require("../controllers/userController");
const { authMiddleware, isUser } = require("../middleware/auth");
const Seat = require("../controllers/seatController");
const Booking = require("../controllers/bookingController");

router.route("/signup").post(catchAsync(user.signup));
router.route("/login").post(catchAsync(user.login));
router.route("/logout").get(catchAsync(user.logout));

router.route("/hold").post(authMiddleware, isUser, catchAsync(Seat.holdSeats));
router.route("/release").post(authMiddleware, isUser, catchAsync(Seat.releaseSeats));
router.route("/purchase").post(authMiddleware, isUser, catchAsync(Seat.purchaseSeats));
router.route("/confirm").post(authMiddleware, isUser, catchAsync(Booking.confirmBooking));

module.exports = router;