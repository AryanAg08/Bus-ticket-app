const { sqlize } = require("./src/config/supabase");
const Trip = require("./src/models/trip");
const Seat = require("./src/models/seat");

async function seedTrips() {
  try {
    await sqlize.authenticate();
    console.log("✅ DB connected");

    // Wipe existing trips & seats (optional, use with caution)
    await Seat.destroy({ where: {} });
    await Trip.destroy({ where: {} });

    // Fake trips
    const trips = [
      {
        from: "Delhi",
        to: "Jaipur",
        departureTime: new Date("2025-09-15T08:00:00Z"),
        arrivalTime: new Date("2025-09-15T12:00:00Z"),
        busType: "AC Sleeper",
        seatingLayout: { rows: 10, seatsPerRow: 4 },
        seatPricing: 599.99,
        saleDuration: { start: "2025-09-10T00:00:00Z", end: "2025-09-14T23:59:59Z" },
      },
      {
        from: "Mumbai",
        to: "Pune",
        departureTime: new Date("2025-09-16T09:30:00Z"),
        arrivalTime: new Date("2025-09-16T12:00:00Z"),
        busType: "Non-AC Seater",
        seatingLayout: { rows: 12, seatsPerRow: 5 },
        seatPricing: 299.99,
        saleDuration: { start: "2025-09-12T00:00:00Z", end: "2025-09-15T23:59:59Z" },
      },
      {
        from: "Bangalore",
        to: "Hyderabad",
        departureTime: new Date("2025-09-18T22:00:00Z"),
        arrivalTime: new Date("2025-09-19T06:00:00Z"),
        busType: "Luxury Sleeper",
        seatingLayout: { rows: 8, seatsPerRow: 3 },
        seatPricing: 899.99,
        saleDuration: { start: "2025-09-14T00:00:00Z", end: "2025-09-18T18:00:00Z" },
      },
    ];

    for (const tripData of trips) {
      // Create trip
      const trip = await Trip.create(tripData);

      // Generate seats
      const { rows, seatsPerRow } = tripData.seatingLayout;
      const seatPricing = parseFloat(tripData.seatPricing);

      const seats = [];
      for (let r = 1; r <= rows; r++) {
        for (let s = 1; s <= seatsPerRow; s++) {
          seats.push({
            tripId: trip.id,
            seatNo: `${r}-${s}`,
            price: seatPricing,
            isBooked: false,
          });
        }
      }

      await Seat.bulkCreate(seats);
      console.log(`🎉 Trip ${trip.from} → ${trip.to} created with ${seats.length} seats`);
    }

    console.log("✅ All trips & seats seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding trips:", err);
    process.exit(1);
  }
}

seedTrips();
