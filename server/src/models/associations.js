const User = require("./user");
const Trip = require("./trip");
const Seat = require("./seat");
const Booking = require("./booking");

// A user can have many bookings
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

// A trip can have many bookings
Trip.hasMany(Booking, { foreignKey: "tripId" });
Booking.belongsTo(Trip, { foreignKey: "tripId" });

// A booking can include many seats (Many-to-Many)
Booking.belongsToMany(Seat, {
  through: "BookingSeats",
  foreignKey: "bookingId",
});
Seat.belongsToMany(Booking, {
  through: "BookingSeats",
  foreignKey: "seatId",
});

module.exports = { User, Trip, Seat, Booking };
