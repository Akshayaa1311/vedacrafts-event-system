import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n";

import { BrowserRouter, Routes, Route } from "react-router-dom";


import App from "./App";
import RegistrationPage from "./Components/RegistrationPage";
import AdminLogin from "./Components/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import CreateEvent from "./Pages/CreateEvent";
import Events from "./Pages/Events";
import Registrations from "./Pages/Registrations";
import Analytics from "./Pages/Analytics";
import Settings from "./Pages/Settings";
import EditEvent from "./Pages/EditEvent";

import ProtectedRoute from "./ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/create-event"
  element={
    <ProtectedRoute>
      <CreateEvent />
    </ProtectedRoute>
  }
/>

<Route
  path="/events"
  element={
    <ProtectedRoute>
      <Events />
    </ProtectedRoute>
  }
/>

<Route
  path="/Registrations"
  element={
    <ProtectedRoute>
      <Registrations />
    </ProtectedRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>

<Route
  path="/edit-event/:id"
  element={
    <ProtectedRoute>
      <EditEvent />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);