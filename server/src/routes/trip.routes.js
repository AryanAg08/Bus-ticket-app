const router = require("express").Router();
const catchAsync = require("../utils/catchasync");
const tripController = require("../controllers/tripController");
const { authMiddleware, isOrganiser } = require("../middleware/auth");

// Public endpoints
router.get("/", catchAsync(tripController.getAllTrips));
router.get("/:id", catchAsync(tripController.getTripById));
router.get("/:id/seats", catchAsync(tripController.getSeatsForTrip));

// Organiser-only: update or delete trips
router.put("/:id", authMiddleware, isOrganiser, catchAsync(tripController.updateTrip));
router.delete("/:id", authMiddleware, isOrganiser, catchAsync(tripController.deleteTrip));

module.exports = router;
