// App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const { authUser, checkAuth } = useAuthStore();

  // On mount, verify whether the user is logged in
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      {/* Public homepage */}
      <Route path="/" element={<HomePage />} />

      {/* Dashboard: only accessible if authUser is truthy */}
      <Route
        path="/dashboard"
        element={
          authUser
            ? <DashboardPage />
            : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}
