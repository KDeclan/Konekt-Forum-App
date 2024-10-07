require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const connectDB = require("./config/db");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const helmet = require("helmet");

const { authenticateSocket } = require("./middleware/authMiddleware");

const app = express();
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://konekt-forum-app.onrender.com";

// Apply security middleware before other middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com", "'unsafe-inline'"], // Allow inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://konekt-forum-app.onrender.com"],
      imgSrc: ["'self'", "data:", "https://konekt-forum-app.onrender.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Use CORS middleware before other middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Use the FRONTEND_URL from the .env file
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Parse JSON requests and cookies
app.use(express.json());
app.use(cookieParser());

// Initialize Passport for authentication
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// Apply authentication routes
app.use("/auth", authRoutes);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle requests for favicon.ico to prevent the browser from requesting a non-existent favicon
app.get("/favicon.ico", (req, res) => res.status(204)); // No Content

// Catch-all handler to return the React app's index.html for any unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL, // Update to use the FRONTEND_URL variable
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

// Apply socket authentication middleware
io.use(authenticateSocket);

const onlineUsers = [];
const roomName = "globalChat"; // Define a common room name for all users

// Set up Socket.IO events
io.on("connection", (socket) => {
  const user = socket.user; // Extract the user information attached by the authenticateSocket middleware
  console.log("User connected with details from DB:", user);

  if (!user || !user.username || !user.avatar || !user.discordId) {
    console.error("User object is missing or incomplete.");
    socket.disconnect();
    return;
  }

  // Make the user join the "globalChat" room
  socket.join(roomName);

  // Add the user to the list of connected users
  onlineUsers.push({
    id: socket.id,
    username: user.username,
    userId: user.discordId, // Use the correct Discord ID
    avatar: user.avatar,
  });

  // Notify everyone in the room that a new user has connected
  io.to(roomName).emit(
    "userConnected",
    `${user.username} has joined the chat.`
  );

  // Emit the updated list of users to all clients in the room
  io.to(roomName).emit("usersUpdate", onlineUsers);

  // Listen for incoming messages from this user
  socket.on("message", (data) => {
    console.log("Received a message from client:", data);
    const userMessage = {
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
      },
      text: data.text,
    };

    // Emit the message to all clients in the room
    io.to(roomName).emit("message", userMessage);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    const index = onlineUsers.findIndex((u) => u.id === socket.id);
    if (index !== -1) {
      const disconnectedUser = onlineUsers.splice(index, 1)[0];

      // Notify others in the room that the user has disconnected
      io.to(roomName).emit(
        "userDisconnected",
        `${disconnectedUser.username} has left the chat.`
      );

      // Update the list of connected users in the room
      io.to(roomName).emit("usersUpdate", onlineUsers);
    }
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
