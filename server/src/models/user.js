const { DataTypes } = require("sequelize");
const { sqlize } = require("../config/supabase");
const bcrypt = require("bcryptjs");

const User = sqlize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("user", "organiser", "admin"), // 👈 allowed roles
    defaultValue: "user", // default role
  },
}, {
  timestamps: true,
  tableName: "users",
});

// 🔑 Hash password before saving
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

module.exports = User;
