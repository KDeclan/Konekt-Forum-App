const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/discord-user"); // Import your User model

// Middleware for Express HTTP routes
const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  console.log("Extracted token from request cookies:", token); // Debugging

  if (!token) {
    console.error("No token found in cookies");
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    try {
      // Fetch the full user details from the database
      const user = await User.findById(decodedToken.id).select(
        "discordId username avatar"
      );

      if (!user) {
        console.error("User not found in the database");
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("Fetched user details from DB:", user);

      // Attach the full user object to the request
      req.user = user;
      next();
    } catch (error) {
      console.error("Error fetching user from database:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

// Middleware for Socket.IO
const authenticateSocket = async (socket, next) => {
  const cookies = socket.handshake.headers.cookie;
  const tokenFromHeader = socket.handshake.headers.authorization;

  let token;

  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    token = parsedCookies.token;
  } else if (tokenFromHeader && tokenFromHeader.startsWith("Bearer ")) {
    token = tokenFromHeader.split(" ")[1];
  }

  console.log("Extracted token for Socket.IO:", token); // Debugging

  if (!token) {
    console.error("No token found for Socket.IO authentication");
    return next(new Error("Unauthorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return next(new Error("Forbidden"));
    }

    try {
      // Fetch the full user details from the database
      const user = await User.findById(decodedToken.id).select(
        "discordId username avatar"
      );

      if (!user) {
        console.error("User not found in the database");
        return next(new Error("Unauthorized"));
      }

      console.log("Fetched user details from DB:", user);

      // Attach the full user object to the socket
      socket.user = user;
      next();
    } catch (error) {
      console.error("Error fetching user from database:", error);
      return next(new Error("Internal server error"));
    }
  });
};

module.exports = { authenticateToken, authenticateSocket };
