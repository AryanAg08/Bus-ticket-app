import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { socket } from "../socket";
import { AuthContext } from "../App";
import { toast } from "react-toastify";

export default function SeatMap() {
  const { tripId } = useParams();
  const { token } = useContext(AuthContext);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeats();

    socket.on("seatHeld", (data) => {
      if (data.tripId.toString() === tripId.toString()) {
        toast.info(`Seat ${data.seatNo} held`);
        fetchSeats();
        // notify when a hold is about to expire if TTL provided
        if (data.ttl) {
          const warnAt = Math.max(0, data.ttl - 10); // warn 10s before
          setTimeout(() => {
            toast.warn(`Hold on ${data.seatNo} is about to expire`);
          }, warnAt * 1000);
        }
      }
    });

    socket.on("seatReleased", (data) => {
      if (data.tripId.toString() === tripId.toString()) {
        toast.info(`Seat ${data.seatNo} released`);
        fetchSeats();
      }
    });

    socket.on("seatSold", (data) => {
      if (data.tripId.toString() === tripId.toString()) {
        toast.success(`Seat ${data.seatNo} sold`);
        fetchSeats();
      }
    });

    return () => {
      socket.off("seatHeld");
      socket.off("seatReleased");
      socket.off("seatSold");
    };
  }, [tripId]);

  function fetchSeats() {
    api.getSeats(tripId, token).then(setSeats).catch((err) => {
      console.error(err);
      toast.error("Failed to load seats");
    });
  }

  function toggleSeat(seatNo) {
    setSelected((s) => (s.includes(seatNo) ? s.filter(x => x !== seatNo) : [...s, seatNo]));
  }

  async function holdSelected() {
    if (!selected.length) return toast.info("Select seats to hold");
    try {
      const res = await api.holdSeats({ tripId, seatNos: selected }, token);
      toast.success("Seats held");
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
      await api.confirmBooking({ tripId, seatNos: selected }, token)
      toast.success("Purchase successful");
      navigate("/booking", { state: { tripId, seatNos: selected } });
    } catch (err) {
      toast.error(err.message || "Purchase failed");
    }
  }

  return (
    <div>
      <h2>Trip {tripId} - Seat Map</h2>
      <div className="seat-grid">
        {seats.map((s) => {
          const heldByOther = s.hold && s.hold.userId && s.hold.userId !== (token ? parseJwt(token).id : null);
          return (
            <div key={s.seatNo}
              className={`seat ${s.isBooked ? 'booked' : s.hold ? 'held' : ''} ${selected.includes(s.seatNo) ? 'selected' : ''}`}
              onClick={() => {
                if (s.isBooked) return;
                if (s.hold && (!selected.includes(s.seatNo) && heldByOther)) return toast.info('Held by other');
                toggleSeat(s.seatNo);
              }}
              title={s.hold ? `Hold info: ${JSON.stringify(s.hold)}` : ''}
            >
              {s.seatNo}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        <button className="btn" onClick={holdSelected}>Hold</button>
        <button className="btn" onClick={releaseSelected}>Release</button>
        <button className="btn" onClick={purchaseSelected}>Purchase</button>
      </div>
    </div>
  );
}

// helper to decode token (lightweight, not secure)
function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return {};
  }
}