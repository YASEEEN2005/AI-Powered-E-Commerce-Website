// src/Routers/AdminRouters.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminLogin from "../Admin/AdminLogin";
import AdminDashboard from "../Admin/AdminDashboard";
import AdminTopNav from "../Admin/AdminTopNav";
import AdminRoute from "../componets/AdminRoute";
import AdminUsers from "../Admin/AdminUsers";

function AdminRouters() {
  return (
    <Routes>
      <Route path="" element={<AdminLogin />} />

      {/* Protected wrapper */}
      <Route element={<AdminRoute />}>
        <Route
          path="dashboard"
          element={
            <>
              <AdminTopNav />
              <AdminDashboard />
            </>
          }
        />
        <Route
        path="users"
        element={
          // <AdminRoute>
            <>
              <AdminTopNav />
            <AdminUsers />
            </>
          // </AdminRoute>
        }
      />
      </Route>
    </Routes>
  );
}

export default AdminRouters;
