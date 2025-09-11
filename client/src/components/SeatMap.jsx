// src/components/SeatMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { socket } from "../socket";
import "./seatmap.css";
import { toast } from "react-toastify";

export default function SeatMap() {
    const [tick, setTick] = useState(0);
    const [trip, setTrip] = useState(null);
  const { tripId } = useParams();
  const token = localStorage.getItem("authToken");
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const userIdFromToken = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload)).id;
    } catch (e) {
      return null;
    }
  };
  const myId = userIdFromToken(token);
// const myId = token ? String(parseJwt(token).id) : null;

  // fetch seats and set state
  async function fetchSeats() {
    try {
      const data = await api.getSeats(tripId, token);
      setSeats(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load seats");
    }
  }

  async function fetchTrip() {
  try {
    const data = await api.getTrip(tripId, token); // Make sure you have this API endpoint
    setTrip(data);
  } catch (err) {
    toast.error("Failed to load trip details");
  }
}

useEffect(() => {
  fetchTrip();
}, [tripId]);


  // initial fetch + socket listeners
  useEffect(() => {
  const id = setInterval(() => setTick(t => t + 1), 1000);
  return () => clearInterval(id);
}, []);

  useEffect(() => {
    fetchSeats();

    socket.on("seatHeld", (data) => {
      if (!data || data.tripId?.toString() !== tripId?.toString()) return;
      // data.hold or data.expiresAt
      fetchSeats();
    });

    socket.on("seatReleased", (data) => {
      if (!data || data.tripId?.toString() !== tripId?.toString()) return;
      fetchSeats();
    });

    socket.on("seatSold", (data) => {
      if (!data || data.tripId?.toString() !== tripId?.toString()) return;
      fetchSeats();
    });

    return () => {
      socket.off("seatHeld");
      socket.off("seatReleased");
      socket.off("seatSold");
    };
  }, [tripId]);

  // tick to re-render every second for countdowns
  useEffect(() => {
    const id = setInterval(() => {
      setSeats((prev) => [...prev]); // shallow copy to trigger re-render
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function toggleSeat(seatNo) {
    setSelected((s) => (s.includes(seatNo) ? s.filter((x) => x !== seatNo) : [...s, seatNo]));
  }

  async function holdSelected() {
    if (!selected.length) return toast.info("Select seats to hold");
    try {
      const res = await api.holdSeats({ tripId, seatNos: selected }, token);
      // res.results expected
      if (res?.results) {
        const failed = res.results.filter((r) => !r.ok);
        if (failed.length) {
          failed.forEach((f) => toast.error(`Seat ${f.seatNo}: ${f.reason || "Hold failed"}`));
        } else {
          toast.success("Seats held");
        }
      } else {
        toast.success("Seats held");
      }
      setSelected([]);
      fetchSeats();
    } catch (err) {
      toast.error(err.message || "Hold failed");
    }
  }

  async function releaseSelected() {
    if (!selected.length) return toast.info("Select seats to release");
    try {
      await api.releaseSeats({ tripId, seatNos: selected }, token);
      toast.info("Seats released");
      setSelected([]);
      fetchSeats();
    } catch (err) {
      toast.error(err.message || "Release failed");
    }
  }

  async function purchaseSelected() {
    if (!selected.length) return toast.info("Select seats to purchase");
    try {
      await api.purchaseSeats({ tripId, seatNos: selected }, token);
      await api.confirmBooking({ tripId, seatNos: selected }, token);
      toast.success("Purchase successful");
      // clear selected timers by refetch
      setSelected([]);
      fetchSeats();
      navigate("/booking", { state: { tripId, seatNos: selected } });
    } catch (err) {
      toast.error(err.message || "Purchase failed");
    }
  }

  function getCountdownFromHold(hold) {
    if (!hold?.expiresAt) return null;
    const diff = Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000));
    return diff > 0 ? `${diff}s` : "Expired";
  }

  // derive columns (seats per row) from seatNo pattern "r-c"
  const cols = useMemo(() => {
    if (!seats.length) return 6;
    let maxCol = 0;
    seats.forEach((s) => {
      const parts = (s.seatNo || "").split("-");
      const col = parseInt(parts[1], 10);
      if (!isNaN(col) && col > maxCol) maxCol = col;
    });
    return maxCol || 6;
  }, [seats]);

  // sort seats by row then column (if seatNo format row-col)
  const sortedSeats = useMemo(() => {
    return [...seats].sort((a, b) => {
      const pa = (a.seatNo || "").split("-").map((x) => parseInt(x, 10));
      const pb = (b.seatNo || "").split("-").map((x) => parseInt(x, 10));
      const ra = pa[0] || 0;
      const ca = pa[1] || 0;
      const rb = pb[0] || 0;
      const cb = pb[1] || 0;
      if (ra === rb) return ca - cb;
      return ra - rb;
    });
  }, [seats]);

   

  return (
    <div className="seatmap-container">
    <h2>
  {trip
    ? `Trip: ${trip.from} → ${trip.to} | Date: ${new Date(trip.date).toLocaleDateString()} | Time: ${trip.time}`
    : `Trip ${tripId} - Seat Map`}
</h2>


      <div className="legend">
        <span className="seat available">Available</span>
        <span className="seat selected">Selected</span>
        <span className="seat held-self">Held by You</span>
        <span className="seat held-other">Held by Other</span>
        <span className="seat booked">Booked</span>
      </div>

      <div
        className="seat-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 60px)` }}
      >
      

{sortedSeats.map((s) => {
  const isHeld = !!s.hold;
  const holdUserId = isHeld ? String(s.hold.userId) : null;

  const heldByMe = isHeld && holdUserId === myId;
  const heldByOther = isHeld && holdUserId !== myId;

  let seatClass = "seat";
  if (s.isBooked) seatClass += " booked";
  else if (heldByMe) seatClass += " held-self";
  else if (heldByOther) seatClass += " held-other";
  else seatClass += " available";

  if (selected.includes(s.seatNo)) seatClass += " selected";

  const countdown = isHeld ? Math.max(0, Math.floor((s.hold.expiresAt - Date.now()) / 1000)) : null;

  return (
    <div
      key={s.seatNo}
      className={seatClass}
      onClick={() => {
        if (s.isBooked) return;
        if (heldByOther) return toast.info("Held by other");
        toggleSeat(s.seatNo);
      }}
    >
      {s.seatNo}
      {countdown && <div className="timer">{countdown > 0 ? `${countdown}s` : "Expired"}</div>}
    </div>
  );
})}


      </div>

      <div className="seat-actions">
        <button className="btn" onClick={holdSelected}>
          Hold
        </button>
        <button className="btn" onClick={releaseSelected}>
          Release
        </button>
        <button className="btn" onClick={purchaseSelected}>
          Purchase
        </button>
      </div>
    </div>
  );
}
