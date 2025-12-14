import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminLogin from "../Admin/AdminLogin";
import AdminDashboard from "../Admin/AdminDashboard";
import AdminTopNav from "../Admin/AdminTopNav";
import AdminRoute from "../componets/AdminRoute";
import AdminUsers from "../Admin/AdminUsers";
import AdminSellers from "../Admin/AdminSellers";
import AdminSellerDetails from "../Admin/AdminSellerDetails";
import AdminProducts from "../Admin/AdminProducts";
import AdminOrders from "../Admin/AdminOrders";
import AdminPayments from "../Admin/AdminPayments";
import AdminRevenue from "../Admin/AdminRevenue";
import AdminMessages from "../Admin/AdminMessages";

function AdminRouters() {
  return (
    <Routes>
      <Route path="" element={<AdminLogin />} />

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
            <>
              <AdminTopNav />
              <AdminUsers />
            </>
          }
        />
        <Route
          path="sellers"
          element={
            <>
              <AdminTopNav />
              <AdminSellers />
            </>
          }
        />
        <Route
          path="sellers/:id"
          element={
            <>
              <AdminTopNav />
              <AdminSellerDetails />
            </>
          }
        />
              <Route
        path="products"
        element={
    
            <>
              <AdminTopNav />
              <AdminProducts />
            </>

        }
      />
              <Route
        path="orders"
        element={
    
            <>
              <AdminTopNav />
              <AdminOrders />
            </>

        }
      />
              <Route
        path="payments"
        element={
    
            <>
              <AdminTopNav />
              <AdminPayments />
            </>

        }
      />
              <Route
        path="revenue"
        element={
    
            <>
              <AdminTopNav />
              <AdminRevenue />
            </>

        }
      />
              <Route
        path="messages"
        element={
    
            <>
              <AdminTopNav />
              <AdminMessages />
            </>

        }
      />
      </Route>
    </Routes>
  );
}

export default AdminRouters;
