const Seat = require("../models/seat");
const { placeHold, getHold, releaseHold, isSeatHeld, holdKey } = require("../utils/holds");
const { redis } = require("../config/redis");
const { io } = require("../index");
const { sqlize } = require("../config/supabase");

exports.holdSeats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId, seatNos, ttl = 300 } = req.body;

    if (!tripId || !Array.isArray(seatNos) || seatNos.length === 0) {
      return res.status(400).json({ message: "tripId and seatNos are required" });
    }

    const results = [];
    for (const seatNo of seatNos) {
      const seat = await Seat.findOne({ where: { tripId, seatNo } });
      if (!seat) {
        results.push({ seatNo, ok: false, reason: "SeatNotFound" });
        continue;
      }
      if (seat.isBooked) {
        results.push({ seatNo, ok: false, reason: "AlreadyBooked" });
        continue;
      }

       const holdData = await placeHold(tripId, seatNo, userId, ttl);

      if (holdData) {
        await redis.set(key = `hold:${tripId}:${seatNo}`, JSON.stringify(holdData), "EX", ttl).catch(()=>{});

        results.push({ seatNo, ok: true, hold: holdData });
        // emit the full hold object for clients
        io.emit("seatHeld", { tripId, seatNo, hold: holdData });
      } else {
        const existing = await getHold(tripId, seatNo);
        results.push({
          seatNo,
          ok: false,
          reason: existing ? "HeldByOther" : "Unknown",
          holder: existing?.userId,
          expiresAt: existing?.expiresAt || null,
        });
      }
    }

    return res.json({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Hold failed" });
  }
};

exports.releaseSeats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId, seatNos, force } = req.body;
    if (!tripId || !Array.isArray(seatNos) || seatNos.length === 0) {
      return res.status(400).json({ message: "tripId and seatNos are required" });
    }

    const results = [];
    for (const seatNo of seatNos) {
      const key = holdKey(tripId, seatNo);
      const hold = await redis.get(key);
      if (!hold) {
        results.push({ seatNo, ok: false, reason: "NotHeld" });
        continue;
      }
      const parsed = JSON.parse(hold);
      const isHolder = parsed.userId === userId;
      const isAdmin = req.user.role === "admin"; // for admin if they want to release seat!!!
      if (!isHolder && !isAdmin && !force) {
        results.push({ seatNo, ok: false, reason: "NotHolder" });
        continue;
      }

      await redis.del(key);
      await redis.srem(`userholds:${parsed.userId}`, key).catch(() => {});
      results.push({ seatNo, ok: true });
      io.emit("seatReleased", { tripId, seatNo, hold: parsed, reason: "released_by_user" });
    }

    return res.json({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Release failed" });
  }
};

exports.purchaseSeats = async (req, res) => {
  const userId = req.user.id;
  const { tripId, seatNos } = req.body;
  if (!tripId || !Array.isArray(seatNos) || seatNos.length === 0) {
    return res.status(400).json({ message: "tripId and seatNos are required" });
  }

  try {
    const bookedSeats = [];

    await sqlize.transaction(async (t) => {
      for (const seatNo of seatNos) {
        const seat = await Seat.findOne({ where: { tripId, seatNo }, transaction: t, lock: t.LOCK.UPDATE });
        if (!seat) throw new Error(`Seat ${seatNo} not found`);
        if (seat.isBooked) throw new Error(`Seat ${seatNo} already sold`);

        const key = `hold:${tripId}:${seatNo}`;
        let parsed = null;
        const holdVal = await redis.get(key);
        if (holdVal) {
          parsed = JSON.parse(holdVal);
          if (parsed.userId !== userId && req.user.role !== "admin") {
            throw new Error(`Seat ${seatNo} held by another user`);
          }
        }

        seat.isBooked = true;
        await seat.save({ transaction: t });

        bookedSeats.push(seatNo);

        await redis.del(key);
        await redis.srem(`userholds:${parsed?.userId || userId}`, key).catch(() => {});
      }
    });

    for (const seatNo of bookedSeats) {
      io.emit("seatSold", { tripId, seatNo, userId });
    }

    return res.json({ message: "Purchase successful", seats: bookedSeats });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || "Purchase failed" });
  }
};

exports.getSeatsForTrip = async (req, res) => {
  const { tripId } = req.params;
  const seats = await Seat.findAll({ where: { tripId }, order: [["seatNo", "ASC"]] });

  const keys = seats.map((s) => `hold:${tripId}:${s.seatNo}`);
  const holdVals = keys.length ? await redis.mget(...keys) : [];

  const response = seats.map((s, idx) => {
    const holdVal = holdVals[idx];
    return {
      seatNo: s.seatNo,
      isBooked: s.isBooked,
      hold: holdVal ? JSON.parse(holdVal) : null,
    };
  });

  res.json(response);
};
