import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { clearAuth } from "./lib/api";
import "./App.css";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import GamefiedDashboard from "./components/GamefiedDashboard";
import MarketingSitePage from "./components/MarketingSitePage";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("testgen_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleAuth = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("testgen_user", JSON.stringify(userData));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("testgen_user");
    clearAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketingSitePage page="home" />} />
        <Route path="/about" element={<MarketingSitePage page="about" />} />
        <Route path="/platform" element={<MarketingSitePage page="platform" />} />
        <Route path="/docs" element={<MarketingSitePage page="docs" />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/app" replace />
            ) : (
              <LoginScreen onAuth={handleAuth} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/app" replace />
            ) : (
              <SignupScreen onAuth={handleAuth} />
            )
          }
        />
        <Route
          path="/app"
          element={
            user ? (
              <GamefiedDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
