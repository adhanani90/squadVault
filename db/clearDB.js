const { Client } = require("pg");
require("dotenv").config();

const CLEAR_SQL = `
DROP TABLE IF EXISTS transfers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS clubs;
DROP TYPE IF EXISTS positions;
`;

async function main() {
  console.log("Clearing database...");

  const clientConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      };

  const client = new Client(clientConfig);

  try {
    await client.connect();
    await client.query(CLEAR_SQL);
    console.log("Database cleared.");
  } catch (err) {
    console.error("Error clearing database:", err.stack);
    throw err;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = main;