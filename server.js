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

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["*"], // Allow images from any source temporarily
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://konekt-forum-app.onrender.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
    },
  })
);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle any other requests (Let React handle them)
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

io.on("connection", (socket) => {
  const user = socket.user; // Extract the user information attached by the authenticateSocket middleware
  console.log("User connected with details from DB:", user);

  if (!user || !user.username || !user.avatar || !user.discordId) {
    console.error("User object is missing or incomplete.");
    socket.disconnect();
    return;
  }

  // Add the user to the list of connected users
  onlineUsers.push({
    id: socket.id,
    username: user.username,
    userId: user.discordId, // Use the correct Discord ID
    avatar: user.avatar,
  });

  // Emit an event to all clients that a new user has connected
  socket.broadcast.emit(
    "userConnected",
    `${user.username} has joined the chat.`
  );

  // Emit the updated list of users to all clients
  io.emit("usersUpdate", onlineUsers);

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

    // Emit the message to all connected clients
    io.emit("message", userMessage);
  });

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
    origin: process.env.FRONTEND_URL, // Use the FRONTEND_URL from the .env file
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

app.use("/auth", authRoutes);

httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
