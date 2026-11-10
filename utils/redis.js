const redis = require('redis');
require('dotenv').config();
const REDIS_URL = process.env.REDIS_URL;

const client = redis.createClient({url: REDIS_URL});

client.on("error", err => {
    console.error("Redis error:", err);
});

client.on("connect", () => {
    console.log("Redis connected");
});

client.on("reconnecting", () => {
    console.log("Redis reconnecting");
});

// await connection (skipped in tests: there's no Redis in CI and the retry loop keeps jest from exiting)
if (process.env.NODE_ENV !== 'test') {
    client.connect().catch(err => console.error("Redis connection failed", err));
}
    




module.exports = client;