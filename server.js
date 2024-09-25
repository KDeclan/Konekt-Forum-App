require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
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

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
