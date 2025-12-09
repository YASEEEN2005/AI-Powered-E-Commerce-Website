import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
