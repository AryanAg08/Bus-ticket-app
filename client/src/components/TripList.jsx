import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { toast } from "react-toastify";

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTrips()
      .then((data) => {
        setTrips(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error("❌ Failed to load trips. Make sure GET /trips exists on backend.");
      });
  }, []);

  if (loading) {
  return (
    <div className="status-message">
      <div className="spinner"></div>
      <p>Loading trips...</p>
    </div>
  );
}


  if (!trips.length) {
    return <div className="status-message">No trips available</div>;
  }

  return (
    <div className="trip-list-container">
      <h2 className="title">🚌 Available Trips</h2>
      <div className="trip-list">
        {trips.map((t) => (
          <div className="card trip-card" key={t.id}>
            <div className="trip-route">
              <span className="from">{t.from}</span> ➜{" "}
              <span className="to">{t.to}</span>
            </div>
            <div className="trip-time">
              <p>
                <strong>Departure:</strong>{" "}
                {new Date(t.departureTime).toLocaleString()}
              </p>
              <p>
                <strong>Arrival:</strong>{" "}
                {new Date(t.arrivalTime).toLocaleString()}
              </p>
            </div>
            <div className="trip-bus">
              <p>
                <strong>Bus Type:</strong> {t.busType}
              </p>
            </div>
            <Link to={`/trip/${t.id}`} className="btn">
              🎟️ Select Seats
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
