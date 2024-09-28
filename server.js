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

const { authenticateSocket } = require("./middleware/authMiddleware");

const app = express();

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
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

io.on("connection", (socket) => {
  const user = socket.user; // Extract the user information attached by the authenticateSocket middleware

  if (!user) {
    socket.disconnect();
    return;
  }

  // Add the user to the list of connected users
  onlineUsers.push({ id: socket.id, username: user.username, userId: user.id });

  // Emit an event to all clients that a new user has connected
  socket.broadcast.emit(
    "userConnected",
    `${user.username} has joined the chat.`
  );

  // Emit the updated list of users to all clients
  io.emit("usersUpdate", onlineUsers);

  // Handle user disconnection
  socket.on("disconnect", () => {
    const index = onlineUsers.findIndex((u) => u.id === socket.id);
    if (index !== -1) {
      const disconnectedUser = onlineUsers.splice(index, 1)[0];

      // Emit an event to all clients that a user has disconnected
      socket.broadcast.emit(
        "userDisconnected",
        `${disconnectedUser.username} has left the chat.`
      );

      // Update the list of connected users
      io.emit("usersUpdate", onlineUsers);
    }
  });
});

const PORT = process.env.PORT || 3000;

connectDB();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

app.use("/auth", authRoutes);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle any other requests (Let React handle them)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
