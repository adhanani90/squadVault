// this file will fetch data from the football org API
require('dotenv').config();

const getStandings = async () => {
  const res = await fetch('https://api.football-data.org/v4/competitions/PL/standings', {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_ORG_API }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data from Football.Org API: ${res.status} ${res.statusText}`);
  }

  const requestsLeft = res.headers.get("X-RequestsAvailable");
  const resetInSeconds = res.headers.get("X-RequestCounter-Reset");


  console.log(`The Football.Org API has ${requestsLeft} requests left. It will reset in ${resetInSeconds} seconds.`)

    if (requestsLeft && parseInt(requestsLeft) < 3) {
        throw new Error(`Football API rate limit nearly reached. Resets in ${resetInSeconds} seconds.`);
    }


    const data = await res.json();

    console.log(JSON.stringify(data, null, 2));


    const season = data.filters.season;
    const table = data.standings[0].table;

    return table.map(entry => ({
        competition:"PL",
        season, 
        position:entry.position,
        team_name:entry.team.name,
        played:entry.playedGames,
        won:entry.won,
        drawn:entry.draw,
        lost:entry.lost,
        points:entry.points
    }));
};

module.exports = {getStandings};