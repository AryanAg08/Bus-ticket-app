import React from "react";
import { useLocation } from "react-router-dom";

export default function BookingSummary() {
  const { state } = useLocation();
  if (!state) return <div className="card">No booking information</div>;

  return (
    <div className="card">
      <h2>Booking Confirmed</h2>
      <p>Trip: {state.tripId}</p>
      <p>Seats: {state.seatNos.join(", ")}</p>
      <p>Check your email for invoice.</p>
    </div>
  );
}