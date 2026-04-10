import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { clearAuth } from "./lib/api";
import "./App.css";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import GamefiedDashboard from "./components/GamefiedDashboard";

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
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <LoginScreen onAuth={handleAuth} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <SignupScreen onAuth={handleAuth} />
            )
          }
        />
        <Route
          path="/"
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
