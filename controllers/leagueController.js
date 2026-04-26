const db = require("../db/queries");
const redisClient = require("../utils/redis");

async function getStandings(req, res){

    // check if redis is up and it has the standings

    if (redisClient.isReady) {
        const cachedStandings = await redisClient.get("standings");
        if (cachedStandings) {
            return res.json(JSON.parse(cachedStandings))
        }
        else {
            const standings = await db.getStandings();
            redisClient.set("standings", JSON.stringify(standings), {EX:60*60});
            return res.json(standings)
        }
    }

    return res.json(await db.getStandings());
}

module.exports = {
    getStandings
}