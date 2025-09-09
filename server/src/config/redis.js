const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully!");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error", err);
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
