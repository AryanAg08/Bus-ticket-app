const { redis } = require("../config/redis");

function holdKey(tripId, seatNo) {
  return `hold:${tripId}:${seatNo}`;
}

async function placeHold(tripId, seatNo, userId, ttl = 300) {
  const key = holdKey(tripId, seatNo);
  const expiresAt = Date.now() + ttl * 1000;
  const holdData = { userId, tripId, seatNo, expiresAt };

  let ok;
  try {
    ok = await redis.set(key, JSON.stringify(holdData), { NX: true, EX: ttl });
  } catch (err) {
    // fallback for clients that expect separate args (ioredis, older clients)
    try {
      ok = await redis.set(key, JSON.stringify(holdData), "NX", "EX", ttl);
    } catch (e) {
      ok = null;
    }
  }

  // redis returns 'OK' when set, null otherwise
  if (ok) {
    try {
      await redis.sadd(`userholds:${userId}`, key);
    } catch (e) {
      // ignore set-add errors
    }
    console.log(`placeHold: held ${key} for user ${userId} until ${new Date(expiresAt).toISOString()}`);
    return holdData;
  }

  return null;
}

async function getHold(tripId, seatNo) {
  const key = holdKey(tripId, seatNo);
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

async function releaseHold(tripId, seatNo) {
  const key = holdKey(tripId, seatNo);
  const val = await redis.get(key);
  if (val) {
    const parsed = JSON.parse(val);
    await redis.del(key);
    await redis.srem(`userholds:${parsed.userId}`, key).catch(() => {});
    return true;
  }
  return false;
}

async function isSeatHeld(tripId, seatNo) {
  const hold = await getHold(tripId, seatNo);
  return !!hold;
}

module.exports = {
  holdKey,
  placeHold,
  getHold,
  releaseHold,
  isSeatHeld,
};
