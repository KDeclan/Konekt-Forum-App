import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Store user info
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true, // Include cookies in the request
        });

        if (response.status === 200 && response.data.authenticated) {
          setAuthenticated(true);
          setUser(response.data.user); // Store user data
          navigate("/dashboard");
        } else {
          setAuthenticated(false);
          setUser(null);
          navigate("/");
        }
      } catch (error) {
        setAuthenticated(false);
        setUser(null);
        navigate("/");
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login authenticated={authenticated} />} />
        <Route
          path="/dashboard"
          element={<Dashboard authenticated={authenticated} user={user} />}
        />
      </Routes>
    </div>
  );
};

export default App;
