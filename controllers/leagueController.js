const db = require("../db/queries");
const redisClient = require("../utils/redis");
const sync = require("../db/syncFootballData");

async function getStandings(req, res){

    // check if redis is up and it has the standings

    if (redisClient.isReady) {
        const cachedStandings = await redisClient.get("standings");
        if (cachedStandings) {
            // check length, do not return if it is less than 10
             const parsedString = JSON.parse(cachedStandings)
             if (parsedString.length > 0) {
                return res.json(parsedString)
            }

        }
        else {
            const standings = await db.getStandings();
            if (standings.length > 10) {
                redisClient.set("standings", JSON.stringify(standings), {EX:60*60});
            }
            return res.json(standings)
        }
    }

    return res.json(await db.getStandings());
}

async function syncStandings(req, res) {
    await sync();
    redisClient.del("standings"); 
    return res.json({message: "Successfully synced standings"});
}

module.exports = {
    getStandings,
    syncStandings
}