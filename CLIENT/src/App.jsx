import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./componets/HomaPage";
import OtpLogin from "./pages/OtpLogin";


function App() {
  return (
    <>

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/login" element={<OtpLogin />} /> */}
      </Routes>

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
