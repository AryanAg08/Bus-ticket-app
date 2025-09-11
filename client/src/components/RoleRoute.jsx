import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../App";

export default function RoleRoute({ children, roleRequired }) {
  const { userRole } = useContext(AuthContext);
  if (!userRole || userRole !== roleRequired) return <Navigate to="/trips" replace />;
  return children;
}