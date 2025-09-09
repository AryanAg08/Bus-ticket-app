const { Sequelize } = require("sequelize")
require("dotenv").config();

const sqlize = new Sequelize(process.env.SUPABASE_DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,

});


const testDbConnection = async () => {
  try {
    await sqlize.authenticate();
    console.log('✅ Supabase Ready!!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sqlize, testDbConnection };