require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json(), express.urlencoded({ extended: true }), cors());

const authRoutes = require("./routes/auth");

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("MongoDB connected...");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));
