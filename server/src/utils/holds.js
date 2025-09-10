const { redis } = require("../config/redis");

const HOLD_PREFIX = "hold";
const userHoldsKey = (userId) => `userholds:${userId}`;

function holdKey(tripId, seatNo) {
  // seatNo must be string like "1-2"
  return `${HOLD_PREFIX}:${tripId}:${seatNo}`;
}

async function isSeatHeld(tripId, seatNo) {
  const key = holdKey(tripId, seatNo);
  return await redis.exists(key); 
}

async function getHold(tripId, seatNo) {
  const key = holdKey(tripId, seatNo);
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

// Try to place a hold atomically: set if not exists with TTL
// returns true if succeeded, false if already held
async function placeHold(tripId, seatNo, userId, ttlSeconds = 300) {
  const key = holdKey(tripId, seatNo);
  const payload = JSON.stringify({ userId, heldAt: Date.now() });
  // NX + EX ensures set only if not exists
  const res = await redis.set(key, payload, "NX", "EX", ttlSeconds);
  if (res === "OK") {
    // add to user's set
    await redis.sadd(userHoldsKey(userId), key);
    // set same expiry on user's set membership cleanup later (not required)
    return true;
  }
  return false;
}

async function releaseHold(tripId, seatNo, userId) {
  const key = holdKey(tripId, seatNo);
  const hold = await getHold(tripId, seatNo);
  if (!hold) return false;
  if (hold.userId !== userId) {
   }
  await redis.del(key);
  await redis.srem(userHoldsKey(userId), key).catch(()=>{});
  return true;
}

module.exports = { holdKey, isSeatHeld, getHold, placeHold, releaseHold, userHoldsKey };
