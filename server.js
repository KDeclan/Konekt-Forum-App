require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const passport = require("./config/passport"); // Passport configuration
const cookieParser = require("cookie-parser"); // Import cookie-parser
const cors = require("cors"); // Import cors for handling CORS issues
const authRoutes = require("./routes/auth"); // Import your auth routes

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser to parse cookies

// Configure CORS to allow requests from your React frontend
app.use(
  cors({
    origin: "http://localhost:3001", // Allow requests from the frontend
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(passport.initialize());

app.use("/auth", authRoutes);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle any other requests that don't match defined routes (Let React handle them)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
