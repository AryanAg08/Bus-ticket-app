import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./components/Navbar";
import Auth from "./components/Auth";
import TripList from "./components/TripList";
import SeatMap from "./components/SeatMap";
import BookingSummary from "./components/BookingSummary";
import OrganiserDashboard from "./components/OrganiserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { socket } from "./socket";

export const AuthContext = React.createContext();

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("socket connected");
    });

    socket.on("globalNotification", (data) => {
      toast.info(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("globalNotification");
    };
  }, []);

  function handleLogin(token, role) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setToken(token);
    setUserRole(role);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setUserRole(null);
  }

  return (
    <AuthContext.Provider value={{ token, userRole, handleLogin, handleLogout }}>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/trips" replace />} />

          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />

          <Route path="/trips" element={<TripList />} />

          <Route path="/trip/:tripId" element={
            <ProtectedRoute>
              <SeatMap />
            </ProtectedRoute>
          } />

          <Route path="/booking" element={
            <ProtectedRoute>
              <BookingSummary />
            </ProtectedRoute>
          } />

          <Route path="/organiser" element={
            <ProtectedRoute>
              <RoleRoute roleRequired="organiser"><OrganiserDashboard /></RoleRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={4000} />
    </AuthContext.Provider>
  );
}