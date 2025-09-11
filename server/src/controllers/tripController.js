const Trip = require("../models/trip");
const Seat = require("../models/seat");

// Get all trips
exports.getAllTrips = async (req, res) => {
  const trips = await Trip.findAll({ order: [["departureTime", "ASC"]] });
  res.json(trips);
};

// Get a single trip
exports.getTripById = async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findByPk(id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json(trip);
};

// Get seats for a trip
exports.getSeatsForTrip = async (req, res) => {
  const { id } = req.params;
  const seats = await Seat.findAll({
    where: { tripId: id },
    order: [["seatNo", "ASC"]],
  });
  res.json(seats);
};

// Update trip (organiser only)
exports.updateTrip = async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findByPk(id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  await trip.update(req.body);
  res.json({ message: "Trip updated successfully", trip });
};

// Delete trip (organiser only)
exports.deleteTrip = async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findByPk(id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  await trip.destroy();
  res.json({ message: "Trip deleted successfully" });
};
