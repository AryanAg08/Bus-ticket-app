const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Trip = require("../models/trip");
const Seat = require("../models/seat");

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // check existing
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Organiser already exists" });
    if (role != "organiser") return res.status(400).json({ message: "Organiser Role signup only!!"});

    const user = await User.create({ email, password, role });

    res.status(201).json({ message: "Organiser created successfully", user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid password" });

    // JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};


exports.logout = async (req, res) => {
  try {
   // delete jwt token in frontend !!!
    res.json({ message: "Logout successful. Please remove token on client side." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logout failed" });
  }
};


exports.createTrip = async (req, res) => {
  try {
    const { from, to, departureTime, arrivalTime, busType, seatingLayout, seatPricing, saleDuration } = req.body;

    const trip = await Trip.create({
      from,
      to,
      departureTime,
      arrivalTime,
      busType,
      seatingLayout,
      seatPricing,
      saleDuration
    });

    const { rows, seatsPerRow } = seatingLayout;
    const seats = [];
    for (let r = 1; r <= rows; r++) {
      for (let s = 1; s <= seatsPerRow; s++) {
        seats.push({ tripId: trip.id, seatNo: `${r}-${s}` });
      }
    }
    await Seat.bulkCreate(seats);

    res.status(201).json({ message: "Trip created successfully", trip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Trip creation failed" });
  }
};
