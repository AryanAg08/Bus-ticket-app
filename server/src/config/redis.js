const Redis = require("ioredis");
const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// A separate subscriber client for keyspace notifications
const sub = new Redis(process.env.UPSTASH_REDIS_URL);

module.exports = { redis, sub };
