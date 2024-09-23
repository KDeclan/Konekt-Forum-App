import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if the user is logged in when the component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Send a request to the backend to verify authentication status
        const response = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true, // Include cookies in the request
        });

        if (response.status === 200 && response.data.authenticated) {
          setAuthenticated(true);
          navigate("/dashboard"); // Redirect to dashboard if authenticated
        } else {
          setAuthenticated(false);
          navigate("/"); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthenticated(false);
        navigate("/"); // Redirect to login on error
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div>
      <Routes>
        {/* Conditional rendering based on authentication status */}
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
