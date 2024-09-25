import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true, // Include cookies in the request
        });

        if (response.status === 200 && response.data.authenticated) {
          setAuthenticated(true);
          navigate("/dashboard");
        } else {
          setAuthenticated(false);
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthenticated(false);
        navigate("/");
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div>
      <Routes>
        <Route path="/" element={authenticated ? <Dashboard /> : <Login />} />
        <Route
          path="/dashboard"
          element={authenticated ? <Dashboard /> : <Login />}
        />
      </Routes>
    </div>
  );
};

export default App;
