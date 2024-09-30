import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "../styles/Dashboard.css";

const Dashboard = ({ authenticated, user }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    if (authenticated && user) {
      const token = document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*=([^;]*).*$)|^.*$/,
        "$1"
      );

      socketRef.current = io("http://localhost:3000", {
        withCredentials: true,
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to the Socket.IO server");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });

      // Listen for incoming chat messages
      socketRef.current.on("message", (message) => {
        console.log("Received a message from the server:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Listen for a user connecting
      socketRef.current.on("userConnected", (message) => {
        console.log("User connected:", message);
        setMessages((prevMessages) => [
          ...prevMessages,
          { system: true, text: message }, // Add system message
        ]);
      });

      // Listen for a user disconnecting
      socketRef.current.on("userDisconnected", (message) => {
        console.log("User disconnected:", message);
        setMessages((prevMessages) => [
          ...prevMessages,
          { system: true, text: message }, // Add system message
        ]);
      });

      // Update the list of online users
      socketRef.current.on("usersUpdate", (users) => {
        console.log("Received updated user list:", users);
        setOnlineUsers(users);
      });

      return () => {
        console.log("Disconnecting from the Socket.IO server...");
        socketRef.current.disconnect();
      };
    }
  }, [authenticated, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      console.warn("Message input is empty. Please enter a message.");
      return;
    }

    if (!authenticated) {
      console.error("User is not authenticated. Cannot send message.");
      return;
    }

    if (!socketRef.current) {
      console.error(
        "Socket connection is not established. Cannot send message."
      );
      return;
    }

    try {
      console.log("Sending message:", messageInput.trim());
      socketRef.current.emit("message", { text: messageInput.trim() });
      setMessageInput(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await fetch("http://localhost:3000/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      console.log("Logout successful. Redirecting to login page.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!authenticated || !user) {
    return <p>Please log in to access the dashboard.</p>;
  }

  return (
    <div className="dashboard container-fluid">
      <div className="row no-gutters">
        {/* Chatbox Left Side */}
        <div className="col-md-9 d-flex flex-column">
          <div className="chatbox flex-grow-1 overflow-auto p-3">
            <div className="messages p-3">
              {messages.map((msg, index) => (
                <div key={index}>
                  {msg.system ? (
                    <em style={{ color: "gray" }}>{msg.text}</em> // Display system messages
                  ) : (
                    <strong>
                      <img
                        className="chat-pfp"
                        src={`https://cdn.discordapp.com/avatars/${msg.user.discordId}/${msg.user.avatar}.png`}
                        alt="User Avatar"
                        style={{ width: "35px", borderRadius: "50%" }}
                      />
                      <span style={{ color: "aliceblue" }}>
                        {msg.user.username}:
                      </span>{" "}
                      {msg.text}
                    </strong>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="logout-btn">
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div className="users-display">
          <h2>Connected Users:</h2>
          <ul>
            {onlineUsers.map((onlineUser, index) => (
              <p key={index} style={{ color: "aliceblue" }}>
                {onlineUser.username}
              </p>
            ))}
          </ul>
        </div>

        {/* Input-container Right Side */}
        <div className="input-container col-md-3 d-flex">
          <div className="p-3 d-flex flex-column justify-content-center flex-grow-1">
            <form className="text-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Enter Message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button className="send-btn btn btn-primary w-100" type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
