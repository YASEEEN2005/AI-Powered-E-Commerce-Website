import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!toast.isActive("auth-warning")) {
      toast.info("Please login to continue", {
        toastId: "auth-warning",
      });
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
