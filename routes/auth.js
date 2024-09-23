const express = require("express");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const passport = require("../config/passport"); // Adjust path as needed
const authenticateToken = require("../middleware/authMiddleware"); // Import your middleware
const router = express.Router();

// Route to initiate Discord OAuth flow
router.get(
  "/discord",
  passport.authenticate("discord", {
    scope: ["identify"], // Include any additional scopes if needed
    session: false, // Disable session
  })
);

// Callback route after Discord authentication
router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/", // Redirect on failure
    session: false, // Disable session
  }),
  (req, res) => {
    // Generate JWT after successful authentication
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d", // Token expiration (e.g., 1 day)
    });

    // Set the token as an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 1 day
    });

    // Redirect to the dashboard on successful authentication
    res.redirect("http://localhost:3001/dashboard");
  }
);

// Endpoint to check authentication status
router.get("/status", authenticateToken, (req, res) => {
  if (req.user) {
    return res.json({
      authenticated: true,
      user: {
        discordId: req.user.discordId,
        username: req.user.username,
        avatar: req.user.avatar,
      },
    });
  }
  res.json({ authenticated: false });
});

module.exports = router;
