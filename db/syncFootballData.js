const {getStandings} = require('../utils/footballOrgUtils');
const pool = require("./pool");
require('dotenv').config();


const UPSERT_SQL = `
    INSERT INTO standings 
        (competition, season, position, team_name, played, won, drawn, lost, points, synced_at)
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (competition, season, team_name) 
    DO UPDATE SET
    position = EXCLUDED.position,
    played = EXCLUDED.played,
    won = EXCLUDED.won,
    drawn = EXCLUDED.drawn,
    lost = EXCLUDED.lost,
    points = EXCLUDED.points,
    synced_at = NOW();
`


async function main() {
  console.log("Getting standing ...");

  try {

    // call getStandings
    const standingsTable = await getStandings();


    for (const entry of standingsTable) {
        await pool.query(UPSERT_SQL,
            [
                entry.competition,
                entry.season,
                entry.position,
                entry.team_name,
                entry.played,
                entry.won,
                entry.drawn,
                entry.lost,
                entry.points,
            ]);
    }


    

    console.log("Standings updated!");
    await pool.end();

  } catch (err) {
    console.error("Error during update:", err.stack);
    throw err; // Important for globalSetup to catch failures
  } 
}

if (require.main === module) {
  main();
}

module.exports = main;
