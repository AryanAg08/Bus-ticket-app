const { DataTypes } = require("sequelize");
const { sqlize } = require("../config/supabase");
const Trip = require("./trip");

const Seat = sqlize.define("Seat", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  seatNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isBooked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // price: {
  //   type: DataTypes.FLOAT,
  //   allowNull: false,
  // }
}, {
  timestamps: true,
  tableName: "seats",
});


Trip.hasMany(Seat, { foreignKey: "tripId", onDelete: "CASCADE" });
Seat.belongsTo(Trip, { foreignKey: "tripId" });

module.exports = Seat;
