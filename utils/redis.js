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

// await connection
client.connect();
    




module.exports = client;