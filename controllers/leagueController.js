const db = require("../db/queries");

async function getStandings(req, res){
    const standings = await db.getStandings();
    res.json(standings);
}

module.exports = {
    getStandings
}