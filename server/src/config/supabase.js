const { Sequelize } = require("sequelize")
require("dotenv").config();

const sqlize = new Sequelize(
  process.env.DB_NAME,     // database name
  process.env.DB_USER,     // username
  process.env.DB_PASS,     // password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
      family: 4, 
    },
  }
);


const testDbConnection = async () => {
  try {
    await sqlize.authenticate();
    console.log('✅ Supabase Ready!!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sqlize, testDbConnection };