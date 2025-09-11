const { redis } = require("../config/redis");

const HOLD_PREFIX = "hold";
const userHoldsKey = (userId) => `userholds:${userId}`;

function holdKey(tripId, seatNo) {
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

// returns true = succeeded, false = already held
async function placeHold(tripId, seatNo, userId, ttlSeconds = 300) {
  const key = holdKey(tripId, seatNo);
  const payload = JSON.stringify({ userId, heldAt: Date.now() });
  const res = await redis.set(key, payload, "NX", "EX", ttlSeconds);
  if (res === "OK") {
    await redis.sadd(userHoldsKey(userId), key);
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
