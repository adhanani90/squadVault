const { Pool } = require("pg");
require('dotenv').config();

// On GitHub/Production, we use connectionString
// Locally, we use your individual variables
const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

module.exports = new Pool(poolConfig);