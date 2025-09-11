const { DataTypes } = require("sequelize");
const { sqlize } = require("../config/supabase");

const Trip = sqlize.define("Trip", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  busType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seatingLayout: {
    type: DataTypes.JSONB, 
    allowNull: false,
    // Example: { rows: 10, seatsPerRow: 4 }
  },
  seatPricing: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  saleDuration: {
    type: DataTypes.JSONB,
    allowNull: false,
    // Example: { start: "2025-09-15T08:00:00Z", end: "2025-09-18T20:00:00Z" }
  }
  
}, {
  timestamps: true,
  tableName: "trips",
});

module.exports = Trip;
