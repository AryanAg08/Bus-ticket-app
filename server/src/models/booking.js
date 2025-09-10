const { DataTypes } = require("sequelize");
const { sqlize } = require("../config/supabase");

const Booking = sqlize.define("Booking", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  status: {
    type: DataTypes.ENUM("PENDING", "CONFIRMED", "CANCELLED"),
    allowNull: false,
    defaultValue: "PENDING",
  },

  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  paymentId: {
    type: DataTypes.STRING, // Store payment reference (Razorpay/Stripe/etc.)
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: "bookings",
});

module.exports = Booking;
