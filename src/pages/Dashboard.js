// dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/user", {
          withCredentials: true, // Include cookies in the request
        });

        if (response.status === 200) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/auth/logout", {
        withCredentials: true, // Include cookies in the request
      });

      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!user) {
    return <p>User data not available. Please log in again.</p>;
  }

  return (
    <div className="dashboard container-fluid">
      <div className="row no-gutters">
        {/* Chatbox Left Side */}
        <div className="col-md-9 d-flex flex-column">
          <div className="chatbox flex-grow-1 overflow-auto p-3">
            <div className="messages p-3">
              <div>
                <strong>
                  <img
                    className="chat-pfp"
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                    alt="User Avatar"
                    style={{ width: "35px", borderRadius: "50%" }}
                  />
                  <span style={{ color: "aliceblue" }}>{user.username}:</span>{" "}
                  hello awdkoakef ajalijed iaowjdlaiwjdalisj
                  adjwliajawdijalisdjaliwjdlia
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="loggout-btn">
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* Input-container Right Side */}
        <div className="input-container col-md-3 d-flex">
          {/* Input Bar */}
          <div className="p-3 d-flex flex-column justify-content-center flex-grow-1">
            <form className="text-form">
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Enter Message"
              />
              <button className="send-btn btn btn-primary w-100">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
