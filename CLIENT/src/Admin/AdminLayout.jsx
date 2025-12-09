import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav />


      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
