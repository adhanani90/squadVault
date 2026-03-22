const { Client } = require("pg");
require("dotenv").config();

const SQL = `
-- 1. Cleanup: Drop in reverse order of creation
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

-- 5. Seed Clubs
INSERT INTO clubs (name, country, stadium) 
VALUES
  ('Arsenal', 'England', 'Emirates Stadium'),
  ('Manchester United', 'England', 'Old Trafford'),
  ('Liverpool', 'England', 'Anfield'),
  ('Chelsea', 'England', 'Stamford Bridge')
ON CONFLICT (name) DO NOTHING;

-- 6. Seed Players
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

-- 7. Create User Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR ( 255 ) NOT NULL UNIQUE,
  password VARCHAR ( 255 ) NOT NULL,
  age INTEGER NOT NULL,
  bio VARCHAR ( 255 ) NOT NULL
);

-- 8. Seed Users
INSERT INTO users (email, password, age, bio)
VALUES
  ('new@gmail.com', 'password123', 25, 'I am a newbie'),
  ('john@gmail.com', 'password456', 25, 'I am an intermediate'),
  ('jane@gmail.com', 'password789', 25, 'I am a pro')
ON CONFLICT DO NOTHING;
`;

async function main() {
  console.log("Seeding database...");
  
  // Tip: Passing an object is often safer than a template string for connection credentials
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  
  try {
    await client.connect();
    await client.query(SQL);
    console.log("Seeding complete! Everything is tidy.");
  } catch (err) {
    console.error("Error during seeding:", err.stack); // .stack gives better debugging than .message
  } finally {
    await client.end();
  }
}

main();