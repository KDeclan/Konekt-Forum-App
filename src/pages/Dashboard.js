// Import necessary modules
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to handle loading status

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Make a request to your backend to get the authenticated user's info
        const response = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true, // Include cookies with the request
        });

        if (response.status === 200 && response.data.authenticated) {
          setUser(response.data.user); // Set the user data from the response
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Stop the loading spinner once data is fetched
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <h2>Hello, {user.username}!</h2>
          <img
            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
            alt="User Avatar"
            style={{ width: "100px", borderRadius: "50%" }}
          />
          <p>Discord ID: {user.discordId}</p>
        </div>
      ) : (
        <p>User data not available. Please log in again.</p>
      )}
    </div>
  );
};

export default Dashboard;
