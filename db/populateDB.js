const { Client } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

const SCHEMA_SQL = `
-- 1. Cleanup (order matters: transfers references players and clubs)
DROP TABLE IF EXISTS transfers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS clubs;
DROP TYPE IF EXISTS positions;

-- 2. Create Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR ( 255 ) NOT NULL UNIQUE,
  country VARCHAR ( 255 ) NOT NULL,
  stadium VARCHAR ( 255 ) NOT NULL
);

-- 3. Create Custom Enum Type
DO $$ BEGIN
    CREATE TYPE positions AS ENUM ('Goalkeeper', 'Defender', 'Midfielder', 'Attacker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create Players Table
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR ( 255 ) NOT NULL,
  last_name VARCHAR ( 255 ) NOT NULL,
  nationality VARCHAR ( 255 ) NOT NULL,
  position positions NOT NULL,
  date_of_birth DATE NOT NULL,
  club_id INTEGER,
  CONSTRAINT fk_players_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

-- 5. Create Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
  id             INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  player_id      INTEGER NOT NULL,
  from_club_id   INTEGER,
  to_club_id     INTEGER NOT NULL,
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount         NUMERIC(15, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_transfers_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfers_from   FOREIGN KEY (from_club_id) REFERENCES clubs(id) ON DELETE SET NULL,
  CONSTRAINT fk_transfers_to     FOREIGN KEY (to_club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transfers_player_id     ON transfers(player_id);
CREATE INDEX IF NOT EXISTS idx_transfers_transferred_at ON transfers(transferred_at DESC);

-- 6. Create User Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR ( 255 ) NOT NULL UNIQUE,
  password VARCHAR ( 255 ) NOT NULL,
  age INTEGER NOT NULL,
  bio VARCHAR ( 255 ) NOT NULL
);

-- 7. Seed Clubs
INSERT INTO clubs (name, country, stadium)
VALUES
  ('Arsenal', 'England', 'Emirates Stadium'),
  ('Manchester United', 'England', 'Old Trafford'),
  ('Liverpool', 'England', 'Anfield'),
  ('Chelsea', 'England', 'Stamford Bridge'),
  ('Manchester City', 'England', 'Etihad Stadium'),
  ('Southampton', 'England', 'St. Mary''s Stadium')
ON CONFLICT (name) DO NOTHING;

-- 8. Seed Players
INSERT INTO players (first_name, last_name, nationality, position, date_of_birth, club_id)
VALUES
  ('Bukayo', 'Saka', 'England', 'Attacker', '2001-09-05', (SELECT id FROM clubs WHERE name = 'Arsenal')),
  ('Martin', 'Odegaard', 'Norway', 'Midfielder', '1998-12-17', (SELECT id FROM clubs WHERE name = 'Arsenal')),
  ('Marcus', 'Rashford', 'England', 'Attacker', '1997-10-31', (SELECT id FROM clubs WHERE name = 'Manchester United')),
  ('Bruno', 'Fernandes', 'Portugal', 'Midfielder', '1994-09-08', (SELECT id FROM clubs WHERE name = 'Manchester United')),
  ('Mohamed', 'Salah', 'Egypt', 'Attacker', '1992-06-15', (SELECT id FROM clubs WHERE name = 'Liverpool')),
  ('Virgil', 'van Dijk', 'Netherlands', 'Defender', '1991-07-08', (SELECT id FROM clubs WHERE name = 'Liverpool')),
  ('Cole', 'Palmer', 'England', 'Midfielder', '2002-05-06', (SELECT id FROM clubs WHERE name = 'Chelsea')),
  ('Reece', 'James', 'England', 'Defender', '1999-12-08', (SELECT id FROM clubs WHERE name = 'Chelsea'))
ON CONFLICT DO NOTHING;

-- 9. Seed Transfers
INSERT INTO transfers (player_id, from_club_id, to_club_id, transferred_at, amount)
VALUES
  (
    (SELECT id FROM players WHERE first_name = 'Cole'   AND last_name = 'Palmer'),
    (SELECT id FROM clubs   WHERE name = 'Manchester City'),
    (SELECT id FROM clubs   WHERE name = 'Chelsea'),
    '2023-09-01',
    47000000.00
  ),
  (
    (SELECT id FROM players WHERE first_name = 'Virgil' AND last_name = 'van Dijk'),
    (SELECT id FROM clubs   WHERE name = 'Southampton'),
    (SELECT id FROM clubs   WHERE name = 'Liverpool'),
    '2018-01-01',
    84650000.00
  );
`;

async function main() {
  console.log("Seeding database...");

  // Use DATABASE_URL if available, otherwise use individual env vars
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
    
    // 1. Run the static Schema and Resource seeding
    await client.query(SCHEMA_SQL);

    // 2. Generate Hashes dynamically
    const saltRounds = 10;
    const hash1 = await bcrypt.hash('password123', saltRounds);
    const hash2 = await bcrypt.hash('password456', saltRounds);
    const hash3 = await bcrypt.hash('password789', saltRounds);

    // 3. Seed Users using parameterized queries (Cleaner and safer)
    const userSeedSQL = `
      INSERT INTO users (email, password, age, bio)
      VALUES 
        ($1, $2, $3, $4),
        ($5, $6, $7, $8),
        ($9, $10, $11, $12)
      ON CONFLICT (email) DO NOTHING;
    `;

    const userValues = [
      'new@gmail.com', hash1, 25, 'I am a newbie',
      'john@gmail.com', hash2, 25, 'I am an intermediate',
      'jane@gmail.com', hash3, 25, 'I am a pro'
    ];

    await client.query(userSeedSQL, userValues);

    console.log("Seeding complete! Everything is tidy.");
  } catch (err) {
    console.error("Error during seeding:", err.stack);
    throw err; // Important for globalSetup to catch failures
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = main;