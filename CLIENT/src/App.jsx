import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./componets/HomaPage";
import OtpLogin from "./pages/OtpLogin";
import ProtectedRoute from "./componets/ProtectedRoute";
import Cart from "./pages/Cart";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>

      
        {/* <Routes>
        <ProtectedRoute>
        <Route path="/login" element={<OtpLogin />} />
        <Route path="/cart" element={<Cart />} />
        </ProtectedRoute>
        </Routes> */}
      

      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
