import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* You can add more routes like /leaderboard later */}
      </Routes>
  );
}
