const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();
const User = require("../models/discord-user");

// Route to initiate Discord OAuth flow
router.get(
  "/discord",
  passport.authenticate("discord", {
    scope: ["identify"],
    session: false,
  })
);

// Callback route after Discord authentication
router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/", // Redirects to the homepage on failure
    session: false,
  }),
  (req, res) => {
    try {
      // Generate JWT with username included
      const token = jwt.sign(
        {
          id: req.user._id,
          discordId: req.user.discordId,
          username: req.user.username,
          avatar: req.user.avatar,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d", // Token expires in 1 day
        }
      );

      // Set the JWT as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true, // Cookie cannot be accessed by JavaScript
        secure: false, // Use secure cookies in production
        sameSite: "lax",
        path: "/", // Ensure the cookie is accessible throughout the app
        maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 1 day
      });

      // Redirect to frontend after successful authentication
      console.log("Redirecting to dashboard after setting token"); // Debugging
      res.redirect("http://localhost:3001/dashboard");
    } catch (error) {
      console.error("Error generating token:", error);
      res.redirect("http://localhost:3001/login?error=auth_failed"); // Redirect to login page with error
    }
  }
);

// Endpoint to check authentication status
router.get("/status", authenticateToken, async (req, res) => {
  try {
    console.log("Checking authentication status for user ID:", req.user.id); // Debugging
    const user = await User.findById(req.user.id).select(
      "discordId username avatar"
    );

    if (!user) {
      return res
        .status(401)
        .json({ authenticated: false, message: "User not found" });
    }

    return res.status(200).json({ authenticated: true, user });
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return res
      .status(500)
      .json({ authenticated: false, message: "Server error", error });
  }
});

// Endpoint to retrieve authenticated user information
router.get("/user", authenticateToken, async (req, res) => {
  try {
    console.log("Retrieving user information for ID:", req.user.id); // Debugging
    const user = await User.findById(req.user.id).select(
      "discordId username avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

// Logout route to clear the authentication token
router.get("/logout", (req, res) => {
  console.log("Clearing token cookie on logout"); // Debugging
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
