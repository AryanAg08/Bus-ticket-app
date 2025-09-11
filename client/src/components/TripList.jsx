import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch trips
    api.getTrips().then((data) => {
      setTrips(data || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
      alert("Failed to load trips. Make sure GET /trips exists on backend.");
    });
  }, []);

  if (loading) return <div className="card">Loading trips...</div>;
  if (!trips.length) return <div className="card">No trips available</div>;

  return (
    <div>
      <h2>Available Trips</h2>
      <div className="trip-list">
        {trips.map((t) => (
          <div className="card trip-card" key={t.id}>
            <div><b>{t.from}</b> ➜ <b>{t.to}</b></div>
            <div>Departure: {new Date(t.departureTime).toLocaleString()}</div>
            <div>Arrival: {new Date(t.arrivalTime).toLocaleString()}</div>
            <div>Bus: {t.busType}</div>
            <Link to={`/trip/${t.id}`} className="btn small">Select Seats</Link>
          </div>
        ))}
      </div>
    </div>
  );
}