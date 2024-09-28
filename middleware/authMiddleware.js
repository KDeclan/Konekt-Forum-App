const jwt = require("jsonwebtoken");
const cookie = require("cookie");

// Middleware for Express HTTP routes
const authenticateToken = (req, res, next) => {
  // Extract the token from the cookies using cookie-parser
  const token = req.cookies.token;

  if (!token) {
    console.error("No token found in cookies");
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    req.user = user; // Attach the verified user to the request object
    next();
  });
};

// Middleware for Socket.IO
const authenticateSocket = (socket, next) => {
  const cookies = socket.handshake.headers.cookie;
  console.log("Cookies from handshake:", cookies); // Add this line for debugging

  if (!cookies) {
    console.error("No cookies found in Socket.IO handshake");
    return next(new Error("Unauthorized"));
  }

  const parsedCookies = cookie.parse(cookies);
  const token = parsedCookies.token;
  console.log("Extracted token:", token); // Add this line for debugging

  if (!token) {
    console.error("No token found in cookies");
    return next(new Error("Unauthorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return next(new Error("Forbidden"));
    }
    socket.user = user;
    next();
  });
};

module.exports = { authenticateToken, authenticateSocket };
