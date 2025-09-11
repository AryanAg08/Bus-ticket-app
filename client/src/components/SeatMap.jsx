import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { socket } from "../socket";
import { toast } from "react-toastify";

export default function SeatMap() {
  const { tripId } = useParams();
  const token = localStorage.getItem("authToken");
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [timers, setTimers] = useState({}); // { seatNo: expiryTimestamp }
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeats();

    socket.on("seatHeld", (data) => {
      if (data.tripId.toString() === tripId.toString()) {
        toast.info(`Seat ${data.seatNo} held`);
        fetchSeats();

        // track TTL countdown
        if (data.ttl) {
          const expiry = Date.now() + data.ttl * 1000;
          setTimers((prev) => ({ ...prev, [data.seatNo]: expiry }));
        }
      }
    });

    socket.on("seatReleased", (data) => {
      if (data.tripId.toString() === tripId.toString()) {
        toast.info(`Seat ${data.seatNo} released`);
        fetchSeats();
        setTimers((prev) => {
          const copy = { ...prev };
          delete copy[data.seatNo];
          return copy;
        });
      }
    });

    socket.on("seatSold", (data) => {
      if (data.tripId.toString() === tripId.toString()) {
        toast.success(`Seat ${data.seatNo} sold`);
        fetchSeats();
        setTimers((prev) => {
          const copy = { ...prev };
          delete copy[data.seatNo];
          return copy;
        });
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
    setSelected((s) =>
      s.includes(seatNo) ? s.filter((x) => x !== seatNo) : [...s, seatNo]
    );
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
      await api.confirmBooking({ tripId, seatNos: selected }, token);
      toast.success("Purchase successful");

      // clear timers for purchased
      setTimers((prev) => {
        const copy = { ...prev };
        selected.forEach((s) => delete copy[s]);
        return copy;
      });

      navigate("/booking", { state: { tripId, seatNos: selected } });
    } catch (err) {
      toast.error(err.message || "Purchase failed");
    }
  }

  // countdown calculation
  function getCountdown(seatNo) {
    const expiry = timers[seatNo];
    if (!expiry) return null;
    const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
    return diff > 0 ? `${diff}s` : null;
  }

  return (
    <div>
      <h2>Trip {tripId} - Seat Map</h2>
      <div className="seat-grid">
        {seats.map((s) => {
          const userId = token ? parseJwt(token).id : null;
          const heldByOther =
            s.hold && s.hold.userId && s.hold.userId !== userId;

          let seatClass = "seat";
          if (s.isBooked) seatClass += " booked"; // red
          else if (s.hold && heldByOther) seatClass += " held-other"; // gray
          else if (s.hold && !heldByOther) seatClass += " held-self"; // yellow
          else seatClass += " available"; // green

          if (selected.includes(s.seatNo)) seatClass += " selected";

          return (
            <div
              key={s.seatNo}
              className={seatClass}
              onClick={() => {
                if (s.isBooked) return;
                if (s.hold && heldByOther) return toast.info("Held by other");
                toggleSeat(s.seatNo);
              }}
            >
              {s.seatNo}
              {seatClass.includes("held-self") && (
                <div className="timer">{getCountdown(s.seatNo)}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
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

// helper to decode token
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return {};
  }
}
