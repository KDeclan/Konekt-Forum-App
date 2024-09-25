const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");
const authenticateToken = require("../middleware/authMiddleware");
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
    failureRedirect: "/",
    session: false,
  }),
  (req, res) => {
    // Generate JWT after successful authentication
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set the JWT as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 1 day
    });

    // Redirect to your frontend without token in query parameters
    res.redirect("http://localhost:3001/dashboard");
  }
);

router.get("/status", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "discordId username avatar"
    );

    if (!user) {
      return res
        .status(401)
        .json({ authenticated: false, message: "User not found" });
    }

    return res.json({ authenticated: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ authenticated: false, message: "Server error", error });
  }
});

router.get("/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "discordId username avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

router.get("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Logged out successfully" });
});

module.exports = router;
