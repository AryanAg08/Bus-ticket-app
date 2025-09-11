import React, { useState, useContext } from "react";
import { api } from "../api";
import { AuthContext } from "../App";
import { toast } from "react-toastify";

export default function OrganiserDashboard() {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    busType: "",
    rows: 5,
    seatsPerRow: 4,
    price: 200.99,
    saleStart: "",
    saleEnd: ""
  });

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();

    const payload = {
      from: form.from,
      to: form.to,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      busType: form.busType,
      seatingLayout: {
        rows: Number(form.rows),
        seatsPerRow: Number(form.seatsPerRow),
      },
      seatPricing:  Number(form.price),//{ default: Number(form.price) },
      saleDuration: {
        start: form.saleStart,
        end: form.saleEnd,
      },
    };

    try {
      await api.createTrip(payload, token);
      toast.success("Trip created");
      setForm({
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        busType: "",
        rows: 5,
        seatsPerRow: 4,
        price: 200,
        saleStart: "",
        saleEnd: ""
      });
    } catch (err) {
      toast.error(err.message || "Create trip failed");
    }
  }

  return (
    <div className="card">
      <h2>Create Trip</h2>
      <form onSubmit={submit}>
        <label>From</label>
        <input
          value={form.from}
          onChange={(e) => update("from", e.target.value)}
          required
        />
        <label>To</label>
        <input
          value={form.to}
          onChange={(e) => update("to", e.target.value)}
          required
        />
        <label>Departure Time</label>
        <input
          type="datetime-local"
          value={form.departureTime}
          onChange={(e) => update("departureTime", e.target.value)}
          required
        />
        <label>Arrival Time</label>
        <input
          type="datetime-local"
          value={form.arrivalTime}
          onChange={(e) => update("arrivalTime", e.target.value)}
          required
        />
        <label>Bus Type</label>
        <input
          value={form.busType}
          onChange={(e) => update("busType", e.target.value)}
        />
        <label>Rows</label>
        <input
          type="number"
          value={form.rows}
          onChange={(e) => update("rows", e.target.value)}
          required
        />
        <label>Seats Per Row</label>
        <input
          type="number"
          value={form.seatsPerRow}
          onChange={(e) => update("seatsPerRow", e.target.value)}
          required
        />
        <label>Price (default)</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          required
        />

        {/* New Sale Duration fields */}
        <label>Sale Start</label>
        <input
          type="datetime-local"
          value={form.saleStart}
          onChange={(e) => update("saleStart", e.target.value)}
          required
        />
        <label>Sale End</label>
        <input
          type="datetime-local"
          value={form.saleEnd}
          onChange={(e) => update("saleEnd", e.target.value)}
          required
        />

        <button className="btn">Create Trip</button>
      </form>
    </div>
  );
}
